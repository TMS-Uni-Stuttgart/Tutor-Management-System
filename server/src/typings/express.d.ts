declare namespace Express {
  type UserDocument = import('../model/documents/UserDocument').UserDocument;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface User extends UserDocument {}

  export interface Request {
    hasAccess?: boolean;
    tutorial?: import('../model/documents/TutorialDocument').TutorialDocument;
    student?: import('../model/documents/StudentDocument').StudentDocument;
  }
}
