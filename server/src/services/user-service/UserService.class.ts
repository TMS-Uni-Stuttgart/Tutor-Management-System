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
import { DocumentNotFoundError } from '../../model/Errors';
import tutorialService from '../tutorial-service/TutorialService.class';

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

  public async createUser(dto: CreateUserDTO): Promise<User> {
    const promises: Promise<TutorialDocument>[] = [];
    dto.tutorials.forEach(id => {
      promises.push(tutorialService.getDocumentWithID(id));
    });

    const tutorials = await Promise.all(promises);

    const userDoc: TypegooseDocument<UserSchema> = {
      ...dto,
      tutorials,
      temporaryPassword: dto.password,
      email: dto.email || '',
    };

    const createdUser = await UserModel.create(userDoc);

    for (const doc of tutorials) {
      doc.tutor = createdUser;
      await doc.save();
    }

    return this.getUserOrReject(createdUser);
  }

  public async updateUser(id: string, { tutorials, ...dto }: UserDTO): Promise<User> {
    const user: UserDocument = await this.getDocumentWithId(id);

    const tutorialsToRemoveUserFrom: string[] = _.difference(
      user.tutorials.map(getIdOfDocumentRef),
      tutorials
    );

    const tutorialsToAddUserTo: string[] = _.difference(
      tutorials,
      user.tutorials.map(getIdOfDocumentRef)
    );

    for (const id of tutorialsToRemoveUserFrom) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.removeUserAsTutorFromTutorial(user, tutorial, { saveUser: false });
    }

    for (const id of tutorialsToAddUserTo) {
      const tutorial = await tutorialService.getDocumentWithID(id);

      await this.makeUserTutorOfTutorial(user, tutorial, { saveUser: false });
    }

    // We connot use mongooses's update(...) in an easy manner here because it would require us to set the '__enc_[FIELD]' properties of all encrypted fields to false manually! This is why all relevant field get updated here and 'save()' is used.
    user.firstname = dto.firstname;
    user.lastname = dto.lastname;
    user.roles = dto.roles;
    user.tutorials = [...user.tutorials];
    user.email = dto.email;

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

  public async getUserOrReject(user: UserDocument | null): Promise<User> {
    if (!user) {
      return this.rejectUserNotFound();
    }

    // Make sure we get a document with decrypted fields.
    (user as EncryptedDocument<UserDocument>).decryptFieldsSync();

    const { id, firstname, lastname, roles, tutorials, temporaryPassword, username, email } = user;

    return {
      id,
      username,
      firstname,
      lastname,
      roles,
      tutorials: tutorials.map(getIdOfDocumentRef),
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
        username: 'admin',
        password: 'admin',
      };

      return this.createUser(admin);
    } catch (err) {
      throw err;
    }
  }
}

const userService = new UserService();

export default userService;
