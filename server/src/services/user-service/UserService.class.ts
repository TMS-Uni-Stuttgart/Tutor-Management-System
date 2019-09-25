import _ from 'lodash';
import { EncryptedDocument } from 'mongoose-field-encryption';
import { Role } from 'shared/dist/model/Role';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { CreateUserDTO, LoggedInUser, User, UserDTO } from 'shared/dist/model/User';
import { isDocument } from 'typegoose';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { TypegooseDocument } from '../../helpers/typings';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import UserModel, {
  UserCredentials,
  UserDocument,
  UserSchema,
} from '../../model/documents/UserDocument';
import {
  LoggedInUserDTO,
  LoggedInUserSubstituteTutorialDTO,
  LoggedInUserTutorialDTO,
} from '../../model/dtos/LoggedInUserDTO';
import { DocumentNotFoundError, BadRequestError } from '../../model/Errors';
import tutorialService from '../tutorial-service/TutorialService.class';
import Logger from '../../helpers/Logger';

class UserService {
  public async getAllUsers(): Promise<User[]> {
    const userDocuments: UserDocument[] = await UserModel.find();
    const users: User[] = [];

    for (const doc of userDocuments) {
      users.push(await this.getUserOrReject(doc));
    }

    return users;
  }

  public async getDocumentWithId(id: string): Promise<UserDocument> {
    const user: UserDocument | null = await UserModel.findById(id);

    if (!user) {
      return this.rejectUserNotFound();
    }

    return user;
  }

  public async getUserWithId(id: string): Promise<User> {
    const user: UserDocument | null = await this.getDocumentWithId(id);

    return this.getUserOrReject(user);
  }

  public async getUserCredentialsWithUsername(username: string): Promise<UserCredentials> {
    // The username field could be encrypted so we create a dummy document which will have the username encrypted (if the 'original' ones have it encrypted aswell).
    const docWithEncryptedUsername: EncryptedDocument<UserDocument> = new UserModel({
      username,
    }) as EncryptedDocument<UserDocument>;
    docWithEncryptedUsername.encryptFieldsSync();

    // The find query is done with the encrypted version of the username.
    const userDocs: UserDocument[] = await UserModel.find({
      username: docWithEncryptedUsername.username,
    });

    if (userDocs.length === 0) {
      return Promise.reject('User with that username was not found.');
    }

    const user = userDocs[0];

    return new UserCredentials(user.id, user.username, user.password);
  }

  public async createUser({
    tutorials: tutorialIds,
    tutorialsToCorrect: tutorialsToCorrectIds,
    password,
    email,
    ...dto
  }: CreateUserDTO): Promise<User> {
    const promises: Promise<TutorialDocument>[] = [];
    tutorialIds.forEach(id => {
      promises.push(tutorialService.getDocumentWithID(id));
    });

    const tutorials = await Promise.all(promises);
    const tutorialsToCorrect = await Promise.all(
      tutorialsToCorrectIds.map(id => tutorialService.getDocumentWithID(id))
    );

    const userDoc: TypegooseDocument<UserSchema> = {
      ...dto,
      password,
      temporaryPassword: password,
      email: email || '',
      // These will be added later.
      tutorials: [],
      tutorialsToCorrect: [],
    };

    const createdUser = await UserModel.create(userDoc);

    for (const doc of tutorials) {
      doc.tutor = createdUser;
      await doc.save();
    }

    for (const doc of tutorialsToCorrect) {
      this.makeUserCorrectorOfTutorial(createdUser, doc, { saveUser: false });
    }

    return this.getUserOrReject(await createdUser.save());
  }

  public async updateUser(
    id: string,
    { tutorials, tutorialsToCorrect, ...dto }: UserDTO
  ): Promise<User> {
    const user: UserDocument = await this.getDocumentWithId(id);
    const currentTutorials: string[] = user.tutorials.map(getIdOfDocumentRef);
    const currentTutorialsToCorrect = user.tutorialsToCorrect.map(getIdOfDocumentRef);

    const tutorialsToRemoveUserFrom: string[] = _.difference(currentTutorials, tutorials);
    const tutorialsToAddUserTo: string[] = _.difference(tutorials, currentTutorials);
    const tutorialsToRemoveUserAsCorrectorFrom = _.difference(
      currentTutorialsToCorrect,
      tutorialsToCorrect
    );
    const tutorialsToAddUserAsCorrectorTo = _.difference(
      tutorialsToCorrect,
      currentTutorialsToCorrect
    );

    for (const id of tutorialsToRemoveUserFrom) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.removeUserAsTutorFromTutorial(user, tutorial, { saveUser: false });
    }

    for (const id of tutorialsToAddUserTo) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.makeUserTutorOfTutorial(user, tutorial, { saveUser: false });
    }

    for (const id of tutorialsToRemoveUserAsCorrectorFrom) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.removeUserAsCorrectorFromTutorial(user, tutorial, { saveUser: false });
    }

    for (const id of tutorialsToAddUserAsCorrectorTo) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.makeUserCorrectorOfTutorial(user, tutorial, { saveUser: false });
    }

    // We connot use mongooses's update(...) in an easy manner here because it would require us to set the '__enc_[FIELD]' properties of all encrypted fields to false manually! This is why all relevant field get updated here and 'save()' is used.
    user.firstname = dto.firstname;
    user.lastname = dto.lastname;
    user.roles = dto.roles;
    user.email = dto.email;

    user.tutorials = [...user.tutorials];
    user.tutorialsToCorrect = [...user.tutorialsToCorrect];

    const updatedUser = await user.save();

    return this.getUserOrReject(updatedUser);
  }

  public async deleteUser(id: string): Promise<User> {
    const user: UserDocument = await this.getDocumentWithId(id);
    await user.populate('tutorials').execPopulate();

    for (const doc of user.tutorials) {
      const tutorial = isDocument(doc)
        ? doc
        : await tutorialService.getDocumentWithID(doc.toString());

      await this.removeUserAsTutorFromTutorial(user, tutorial);
    }

    return this.getUserOrReject(await user.remove());
  }

  public async getTutorialsOfUser(id: string): Promise<Tutorial[]> {
    const user: UserDocument = await this.getDocumentWithId(id);
    const tutorials: Promise<Tutorial>[] = [];

    await user.populate('tutorials').execPopulate();

    for (const doc of user.tutorials) {
      if (isDocument(doc)) {
        tutorials.push(tutorialService.getTutorialOrReject(doc));
      }
    }

    return await Promise.all(tutorials);
  }

  public async setTutorialsOfUser(id: string, tutorialIds: string[]) {
    const user = await this.getDocumentWithId(id);
    await user.populate('tutorials').execPopulate();

    for (const tutorial of user.tutorials) {
      if (!isDocument(tutorial)) {
        throw new Error(
          'UserService::setTutorialsOfUser -- Given Tutorial is NOT a document. It should be a document to be adjustable.'
        );
      }

      await this.removeUserAsTutorFromTutorial(user, tutorial, { saveUser: false });
    }

    // If the user is not saved here than the added tutorials will just be merged with the old ones. With this save the "empty" tutorial list is saved to the DB.
    await user.save();

    for (const id of tutorialIds) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.makeUserTutorOfTutorial(user, tutorial, { saveUser: false });
    }

    await user.save();
  }

  public async getLoggedInUserInformation({ _id }: UserCredentials): Promise<LoggedInUser> {
    const user: UserDocument = await this.getDocumentWithId(_id);
    await user.populate('tutorials').execPopulate();

    const substituteTutorials: Map<Tutorial, Date[]> = new Map();
    const substitutes: LoggedInUserSubstituteTutorialDTO[] = [];
    const tutorials = await tutorialService.getAllTutorials();

    const correctedTutorials: LoggedInUserTutorialDTO[] = tutorials
      .filter(tut => tut.correctors.findIndex(correctorId => correctorId === user.id) !== -1)
      .map(tut => new LoggedInUserTutorialDTO(tut));

    tutorials.forEach(tutorial => {
      Object.entries(tutorial.substitutes)
        .filter(([_, tutorId]) => tutorId === user.id)
        .map(([date]) => new Date(date))
        .forEach(date => {
          const prevDates: Date[] = substituteTutorials.get(tutorial) || [];
          substituteTutorials.set(tutorial, [...prevDates, date]);
        });
    });

    substituteTutorials.forEach((dates, tutorial) =>
      substitutes.push(new LoggedInUserSubstituteTutorialDTO(tutorial, dates))
    );

    return new LoggedInUserDTO(user, substitutes, correctedTutorials);
  }

  public async setPasswordOfUser(id: string, newPassword: string) {
    const user = await this.getDocumentWithId(id);

    user.password = newPassword;
    user.temporaryPassword = undefined;

    user.save();
  }

  public async setTemporaryPasswordOfUser(id: string, newTempPassword: string) {
    const user = await this.getDocumentWithId(id);

    user.password = newTempPassword;
    user.temporaryPassword = newTempPassword;

    user.save();
  }

  /**
   * Adds the given UserDocument to the TutorialDocument and vice versa.
   *
   * This will also adjust the TutorialDocument to have the given UserDocument as 'Tutor'. If the TutorialDocument has already a 'Tutor' this 'Tutor' will be replaced and it's document will be adjusted accordingly. This 'old Tutor' will get saved afterwards regardless of the `saveUser` option.
   *
   * By default this function will __not__ save the UserDocument of the new 'Tutor' after adding the TutorialDocument. To do so provide the `saveUser` option with a truthy value.
   *
   * @param user UserDocument to add the tutorial to
   * @param tutorial TutorialDocument to add
   * @param options _(optional)_ Special options to be passed. Defaults to an empty object.
   */
  public async makeUserTutorOfTutorial(
    user: UserDocument,
    tutorial: TutorialDocument,
    { saveUser }: { saveUser?: boolean } = {}
  ) {
    if (this.hasUserTutorial(user, tutorial)) {
      Logger.warn(
        'User should be added to a tutorial as tutor which he already holds. Skipping rest of process.'
      );
      return;
    }

    if (tutorial.tutor) {
      const oldTutor = await this.getDocumentWithId(getIdOfDocumentRef(tutorial.tutor));

      await this.removeUserAsTutorFromTutorial(oldTutor, tutorial, { saveUser: true });
    }

    tutorial.tutor = user;
    user.tutorials.push(tutorial);

    if (saveUser) {
      await Promise.all([tutorial.save(), user.save()]);
    } else {
      await tutorial.save();
    }
  }

  /**
   * Removes the given UserDocument from the TutorialDocument and vice versa.
   *
   * This will also adjust the TutorialDocument to not have a 'Tutor' anymore.
   *
   * By default this will __not__ save the UserDocument after removing the TutorialDocument. To do so provide the `saveUser` option with a truthy value.
   *
   * @param user UserDocument to remove the TutorialDocument from.
   * @param tutorial TutorialDocument to remove.
   * @param options _(optional)_ Special options to be passed. Defaults to an empty object.
   */
  public async removeUserAsTutorFromTutorial(
    user: UserDocument,
    tutorial: TutorialDocument,
    { saveUser }: { saveUser?: boolean } = {}
  ): Promise<void> {
    const tutorialId: string = tutorial.id;
    tutorial.tutor = undefined;

    user.tutorials = user.tutorials.filter(tut => tutorialId !== getIdOfDocumentRef(tut));

    if (saveUser) {
      await Promise.all([tutorial.save(), user.save()]);
    } else {
      await tutorial.save();
    }
  }

  /**
   * Adds the given User as corrector to the given TutorialDocument.
   *
   * This will adjust the TutorialDocument to include the User as corrector afterwards.
   *
   * If the TutorialDocument already has this user as a corrector nothing is done. If the user does __not__ have the role 'CORRECTOR' a `BadRequestError` is thrown. Both cases skip saving the document(s) completly.
   *
   * By default this function will __not__ save the UserDocument of the corrector after adding it to the TutorialDocument. To do so provide the `saveUser` option with a truthy value.
   *
   * @param user UserDocument which is the corrector
   * @param tutorial Tutorial which the user should correct
   * @param options _(optional)_ Special options to be passed. Defaults to an empty object.
   */
  public async makeUserCorrectorOfTutorial(
    user: UserDocument,
    tutorial: TutorialDocument,
    { saveUser }: { saveUser?: boolean } = {}
  ): Promise<void> {
    if (!this.hasUserRole(user, Role.CORRECTOR)) {
      throw new BadRequestError(
        'Only users with the CORRECTOR role can be set as a corrector a a tutorial.'
      );
    }

    if (this.hasTutorialCorrector(tutorial, user)) {
      Logger.warn(
        'User should be added as corrector to a tutorial which he already corrects. Skipping rest of process'
      );
      return;
    }

    tutorial.correctors.push(user);
    const savePromises: Promise<unknown>[] = [];

    if (saveUser) {
      savePromises.push(user.save());
    }

    savePromises.push(tutorial.save());

    await Promise.all(savePromises);
  }

  /**
   * Removes the given user as corrector from the tutorial.
   *
   * The given user is removed from the TutorialDocument as corrector. If the user was NOT a corrector beforehand the TutorialDocument does not change. However, the saving __will be done__.
   *
   * By default this function will __not__ save the provided UserDocument. To do so provide the `saveUser` option with a truthy value.
   *
   * @param user User to remove as corrector.
   * @param tutorial Tutorial to remove the corrector from.
   * @param options _(optional)_ Special options to be passed. Defaults to an empty object.
   */
  public async removeUserAsCorrectorFromTutorial(
    user: UserDocument,
    tutorial: TutorialDocument,
    { saveUser }: { saveUser?: boolean } = {}
  ): Promise<void> {
    tutorial.correctors = tutorial.correctors.filter(c => getIdOfDocumentRef(c) !== user.id);

    const savePromises: Promise<unknown>[] = [];

    if (saveUser) {
      savePromises.push(user.save());
    }

    savePromises.push(tutorial.save());

    await Promise.all(savePromises);
  }

  public async getUserOrReject(user: UserDocument | null): Promise<User> {
    if (!user) {
      return this.rejectUserNotFound();
    }

    // Make sure we get a document with decrypted fields.
    (user as EncryptedDocument<UserDocument>).decryptFieldsSync();

    const {
      id,
      firstname,
      lastname,
      roles,
      tutorials,
      tutorialsToCorrect,
      temporaryPassword,
      username,
      email,
    } = user;

    return {
      id,
      username,
      firstname,
      lastname,
      roles,
      tutorials: tutorials.map(getIdOfDocumentRef),
      tutorialsToCorrect: tutorialsToCorrect.map(getIdOfDocumentRef),
      temporaryPassword,
      email,
    };
  }

  private async rejectUserNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('User with that ID was not found.'));
  }

  public async initAdmin() {
    try {
      const admin: CreateUserDTO = {
        firstname: 'admin',
        lastname: 'admin',
        email: 'admin@admin.admin',
        roles: [Role.ADMIN],
        tutorials: [],
        tutorialsToCorrect: [],
        username: 'admin',
        password: 'admin',
      };

      return this.createUser(admin);
    } catch (err) {
      throw err;
    }
  }

  private hasUserTutorial(user: UserDocument, tutorial: TutorialDocument): boolean {
    return user.tutorials.findIndex(t => getIdOfDocumentRef(t) === tutorial.id) > -1;
  }

  private hasTutorialCorrector(tutorial: TutorialDocument, user: UserDocument): boolean {
    return tutorial.correctors.findIndex(c => getIdOfDocumentRef(c) === user.id) > -1;
  }

  private hasUserRole(user: UserDocument, role: Role): boolean {
    return user.roles.includes(role);
  }
}

const userService = new UserService();

export default userService;
