import { StudentDTO } from 'shared/dist/model/Student';
import { StudentStore } from './StudentStore';
import { AsyncDispatch } from '../../../util/AsyncReducer';

export enum StudentStoreActionType {
  CREATE,
  UPDATE,
  DELETE,
  REINITIALIZE_START,
  REINITIALIZE_FINISHED,
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

export interface StudentReinitializeStartAction extends StudentStoreBaseAction {
  type: StudentStoreActionType.REINITIALIZE_START;
  data: {
    tutorialId?: string;
    dispatch: AsyncDispatch<StudentStoreAction>;
  };
}

export interface StudentReinitializeFinishedAction extends StudentStoreBaseAction {
  type: StudentStoreActionType.REINITIALIZE_FINISHED;
  data: StudentStore;
}

export type StudentStoreAction =
  | StudentCreateAction
  | StudentUpdateAction
  | StudentDeleteAction
  | StudentReinitializeStartAction
  | StudentReinitializeFinishedAction;
