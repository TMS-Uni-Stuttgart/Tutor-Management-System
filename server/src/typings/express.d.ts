declare namespace Express {
  export interface Request {
    hasAccess?: boolean;
    tutorial?: import('../model/documents/TutorialDocument').TutorialDocument;
    student?: import('../model/documents/StudentDocument').StudentDocument;
  }
}
