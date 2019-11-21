import { StudentDTO } from 'shared/dist/model/Student';

export enum StudentStoreActionType {
  CREATE,
  UPDATE,
  DELETE,
  REINITIALIZE,
}

interface StudentStoreBaseAction {
  type: StudentStoreActionType;
}

export interface StudentCreateAction extends StudentStoreBaseAction {
  type: StudentStoreActionType.CREATE;
  data: StudentDTO;
}

export interface StudentUpdateAction extends StudentStoreBaseAction {
  type: StudentStoreActionType.UPDATE;
  data: {
    studentId: string;
    dto: StudentDTO;
  };
}

export interface StudentDeleteAction extends StudentStoreBaseAction {
  type: StudentStoreActionType.DELETE;
  data: {
    studentId: string;
  };
}

export interface StudentReinitializeAction extends StudentStoreBaseAction {
  type: StudentStoreActionType.REINITIALIZE;
  data: {
    tutorialId?: string;
  };
}

export type StudentStoreAction =
  | StudentCreateAction
  | StudentUpdateAction
  | StudentDeleteAction
  | StudentReinitializeAction;
