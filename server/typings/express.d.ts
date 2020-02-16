declare namespace Express {
  export interface User {
    roles?: import('../src/shared/model/Role').Role[];
  }

  // export interface Request {
  //   hasAccess?: boolean;
  //   tutorial?: import('../model/documents/TutorialDocument').TutorialDocument;
  //   student?: import('../model/documents/StudentDocument').StudentDocument;
  // }
}
