import * as scheincriteriaFunctions from './fetching/Scheincriteria';
import * as sheetFunctions from './fetching/Sheet';
import * as studentFunctions from './fetching/Student';
import * as teamFunctions from './fetching/Team';
import * as tutorialFunctions from './fetching/Tutorial';
import * as userFunctions from './fetching/User';
import * as scheinExamFunctions from './fetching/ScheinExam';
import * as pdfFunctions from './fetching/Files';
import * as informationFunctions from './fetching/Information';

export function useAxios() {
  return {
    ...userFunctions,
    ...tutorialFunctions,
    ...studentFunctions,
    ...teamFunctions,
    ...sheetFunctions,
    ...scheincriteriaFunctions,
    ...scheinExamFunctions,
    ...pdfFunctions,
    ...informationFunctions,
  };
}
