import _ from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMapColumnsHelpers } from '../../../../components/import-csv/hooks/useMapColumnsHelpers';
import { getShortTest } from '../../../../hooks/fetching/ShortTests';
import { getAllStudents } from '../../../../hooks/fetching/Student';
import { useFetchState, UseFetchState } from '../../../../hooks/useFetchState';
import { ShortTest } from '../../../../model/ShortTest';
import { Student } from '../../../../model/Student';
import { RequireChildrenProp } from '../../../../typings/RequireChildrenProp';
import { throwContextNotInitialized } from '../../../../util/throwFunctions';
import { ShortTestColumns } from '../../ImportShortTests';

interface ContextValue extends UseFetchState<Student[], []> {
  iliasNameMapping: Map<string, Student>;
  iliasNamesWithoutStudent: string[];
  studentsWithoutResult: Student[];
  shortTest: ShortTest | undefined;

  addMapping: (iliasName: string, student: Student) => void;
  removeMapping: (iliasName: string) => void;
}

const IliasMappingContext = React.createContext<ContextValue>({
  iliasNameMapping: new Map(),
  iliasNamesWithoutStudent: [],
  studentsWithoutResult: [],
  isLoading: false,
  error: undefined,
  value: [],
  shortTest: undefined,
  execute: throwContextNotInitialized('IliasMappingContext'),
  addMapping: throwContextNotInitialized('IliasMappingContext'),
  removeMapping: throwContextNotInitialized('IliasMappingContext'),
});

interface Props extends RequireChildrenProp {
  shortTestId?: string;
}

export function useIliasMappingContext(): ContextValue {
  return useContext(IliasMappingContext);
}

function IliasMappingProvider({ children, shortTestId }: Props): JSX.Element {
  const { data, mappedColumns } = useMapColumnsHelpers<ShortTestColumns>();
  const { isLoading: isLoadingStudents, error, value: students, execute } = useFetchState({
    fetchFunction: getAllStudents,
    immediate: true,
    params: [],
  });
  const { isLoading: isLoadingShortTest, value: shortTest } = useFetchState({
    fetchFunction: async () => {
      if (!shortTestId) {
        return undefined;
      }

      return getShortTest(shortTestId);
    },
    immediate: true,
    params: [],
  });

  const isLoading = useMemo(() => isLoadingStudents || isLoadingShortTest, [
    isLoadingStudents,
    isLoadingShortTest,
  ]);

  const [iliasNameMapping, setIliasNameMapping] = useState(new Map<string, Student>());
  const [iliasNamesWithoutStudent, setWithoutStudent] = useState<string[]>([]);
  const [studentsWithoutResult, setStudentsWithoutResult] = useState<Student[]>([]);
  const [studentsMappedFromCSV, setStudentsMappedFromCSV] = useState<Student[]>([]);
  const [isWorking, setWorking] = useState(false);

  useEffect(() => {
    const iliasNamesWithoutStudent: string[] = [];
    const studentsWithoutResult: Student[] = [];
    const iliasNameMapping = new Map<string, Student>();
    const studentsAlreadyMapped: Student[] = [];

    if (!isLoading && students) {
      setWorking(true);
      const iliasNamesInData = data.rows
        .map(({ data }) => data[mappedColumns.iliasName])
        .filter(Boolean);

      iliasNamesInData.forEach((iliasName) => {
        if (iliasName) {
          const student = students.find((s) => s.iliasName === iliasName);
          if (student === undefined) {
            iliasNamesWithoutStudent.push(iliasName);
          } else {
            studentsAlreadyMapped.push(student);
            iliasNameMapping.set(iliasName, student);
          }
        }
      });

      students.forEach((student) => {
        const idx = iliasNamesInData.findIndex((name) => name === student.iliasName);

        if (idx === -1) {
          studentsWithoutResult.push(student);
        }
      });

      setIliasNameMapping(iliasNameMapping);
      setStudentsMappedFromCSV(studentsAlreadyMapped);
      setWithoutStudent(iliasNamesWithoutStudent);
      setStudentsWithoutResult(studentsWithoutResult);
      setWorking(false);
    }
  }, [data.rows, isLoading, students, mappedColumns.iliasName]);

  const addMapping = useCallback(
    (iliasName, student) => {
      let nameOfStudent: string | undefined = undefined;

      for (const [name, s] of iliasNameMapping.entries()) {
        if (s.id === student.id) {
          nameOfStudent = name;
        }
      }

      if (nameOfStudent) {
        iliasNameMapping.delete(nameOfStudent);
      }

      iliasNameMapping.set(iliasName, student);
      setIliasNameMapping(new Map(iliasNameMapping));
    },
    [iliasNameMapping]
  );

  const removeMapping = useCallback(
    (iliasName: string) => {
      iliasNameMapping.delete(iliasName);
      setIliasNameMapping(new Map(iliasNameMapping));
    },
    [iliasNameMapping]
  );

  return (
    <IliasMappingContext.Provider
      value={{
        iliasNameMapping,
        iliasNamesWithoutStudent,
        studentsWithoutResult: _.differenceBy(
          studentsWithoutResult,
          [...iliasNameMapping.values()],
          (s) => s.id
        ),
        isLoading: isLoading || isWorking,
        value: _.differenceBy(students, studentsMappedFromCSV, (s) => s.id),
        error,
        shortTest,
        execute,
        addMapping,
        removeMapping,
      }}
    >
      {children}
    </IliasMappingContext.Provider>
  );
}

export default IliasMappingProvider;
