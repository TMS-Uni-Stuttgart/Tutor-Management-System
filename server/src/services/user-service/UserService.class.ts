import _ from 'lodash';
import { Role } from 'shared/dist/model/Role';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { CreateUserDTO, LoggedInUser, User, UserDTO } from 'shared/dist/model/User';
import { isDocument } from 'typegoose';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import TutorialModel, { TutorialDocument } from '../../model/documents/TutorialDocument';
import UserModel, { UserCredentials, UserDocument } from '../../model/documents/UserDocument';
import { LoggedInUserDTO } from '../../model/dtos/LoggedInUserDTO';
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

  public async getUserDocumentWithId(id: string): Promise<UserDocument> {
    const user: UserDocument | null = await UserModel.findById(id);

    if (!user) {
      return this.rejectUserNotFound();
    }

    return user;
  }

  public async getUserWithId(id: string): Promise<User> {
    const user: UserDocument | null = await this.getUserDocumentWithId(id);

    return this.getUserOrReject(user);
  }

  public async getUserCredentialsWithUsername(username: string): Promise<UserCredentials> {
    const user: UserDocument | null = await UserModel.findOne({ username });

    if (!user) {
      return Promise.reject('User not found.');
    }

    return new UserCredentials(user._id, user.username, user.password);
  }

  public async createUser(dto: CreateUserDTO): Promise<User> {
    const promises: Promise<TutorialDocument>[] = [];
    dto.tutorials.forEach(id => {
      promises.push(tutorialService.getTutorialDocumentWithID(id));
    });

    const tutorials = await Promise.all(promises);
    const createdUser = await UserModel.create({ ...dto, tutorials });

    for (const doc of tutorials) {
      doc.tutor = createdUser;
      await doc.save();
    }

    return this.getUserOrReject(createdUser);
  }

  public async updateUser(id: string, { tutorials, ...dto }: UserDTO): Promise<User> {
    const user: UserDocument = await this.getUserDocumentWithId(id);

    const tutorialsToRemoveUserFrom: string[] = _.difference(
      user.tutorials.map(getIdOfDocumentRef),
      tutorials
    );

    const tutorialsToAddUserTo: string[] = _.difference(
      tutorials,
      user.tutorials.map(getIdOfDocumentRef)
    );

    for (const id of tutorialsToRemoveUserFrom) {
      const tutorial = await tutorialService.getTutorialDocumentWithID(id);

      await this.removeUserAsTutorFromTutorial(user, tutorial, { saveUser: false });
    }

    for (const id of tutorialsToAddUserTo) {
      const tutorial = await tutorialService.getTutorialDocumentWithID(id);

      await this.makeUserTutorOfTutorial(user, tutorial, { saveUser: false });
    }

    const tutorialsToSave = user.tutorials.map(getIdOfDocumentRef);

    await user.updateOne({ ...dto, tutorials: tutorialsToSave });
    const updatedUser = await this.getUserDocumentWithId(id);

    return this.getUserOrReject(updatedUser);
  }

  public async deleteUser(id: string): Promise<User> {
    const user: UserDocument = await this.getUserDocumentWithId(id);
    await user.populate('tutorials').execPopulate();

    for (const doc of user.tutorials) {
      const tutorial = isDocument(doc)
        ? doc
        : await tutorialService.getTutorialDocumentWithID(doc.toString());

      await this.removeUserAsTutorFromTutorial(user, tutorial, { saveUser: false });
    }

    return this.getUserOrReject(await user.remove());
  }

  public async getTutorialsOfUser(id: string): Promise<Tutorial[]> {
    const user: UserDocument = await this.getUserDocumentWithId(id);
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
    const user = await this.getUserDocumentWithId(id);
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
      const tutorial = await tutorialService.getTutorialDocumentWithID(id);

      await this.makeUserTutorOfTutorial(user, tutorial, { saveUser: false });
    }

    await user.save();
    return;
  }

  public async getLoggedInUserInformation({ _id }: UserCredentials): Promise<LoggedInUser> {
    const userDoc: UserDocument = await this.getUserDocumentWithId(_id);
    const user: UserDocument = await userDoc.populate('tutorials').execPopulate();

    // TODO: Add substitute Tutorials
    // TODO: Add corrector tutorials

    return new LoggedInUserDTO(user, []);
  }

  public async setPasswordOfUser(id: string, newPassword: string) {
    const user = await this.getUserDocumentWithId(id);

    user.password = newPassword;
    user.temporaryPassword = '';

    user.save();
  }

  public async setTemporaryPasswordOfUser(id: string, newTempPassword: string) {
    const user = await this.getUserDocumentWithId(id);

    user.password = newTempPassword;
    user.temporaryPassword = undefined;

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
      const oldTutor = await this.getUserDocumentWithId(getIdOfDocumentRef(tutorial.tutor));

      await this.removeUserAsTutorFromTutorial(oldTutor, tutorial, { saveUser: true });
    }

    tutorial.tutor = user;
    user.tutorials.push(tutorial._id);

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
    const tutorialId: string = (isDocument(tutorial) ? tutorial._id : tutorial).toString();
    tutorial.tutor = undefined;

    user.tutorials = user.tutorials.filter(tut => {
      const isRemovedTutorial: boolean = isDocument(tut)
        ? tut._id.toString() === tutorialId
        : tut.toString() === tutorialId;

      return !isRemovedTutorial;
    });

    if (saveUser) {
      await Promise.all([tutorial.save(), user.save()]);
    } else {
      await tutorial.save();
    }

    return;
  }

  private async getUserOrReject(user: UserDocument | null): Promise<User> {
    if (!user) {
      return this.rejectUserNotFound();
    }

    const { _id, firstname, lastname, roles, tutorials, temporaryPassword, username } = user;

    return {
      id: _id,
      username,
      firstname,
      lastname,
      roles,
      tutorials: tutorials.map(getIdOfDocumentRef),
      temporaryPassword,
    };
  }

  private async rejectUserNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('User with that ID was not found.'));
  }

  public async initAdmin() {
    try {
      const tutorialDocument = await TutorialModel.create({
        slot: 1,
        tutor: undefined,
        dates: [],
        startTime: new Date(Date.now()),
        endTime: new Date(Date.now()),
        students: [],
        correctors: [],
        teams: [],
        substitutes: {},
      });

      const admin: CreateUserDTO = {
        firstname: 'admin',
        lastname: 'admin',
        roles: [Role.ADMIN],
        tutorials: [tutorialDocument._id],
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
