import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';
import { Tutorial } from '../../model/Tutorial';
import { RequireChildrenProp } from '../../typings/RequireChildrenProp';
import { throwContextNotInitialized } from '../../util/throwFunctions';

interface ParsedCSVDataRow {
  [header: string]: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: ParsedCSVDataRow[];
}

export interface CSVDataRow {
  rowNr: number;
  data: ParsedCSVDataRow;
}

export interface CSVData {
  headers: string[];
  rows: CSVDataRow[];
}

export interface MappedColumns {
  firstnameColumn: string;
  lastnameColumn: string;
  emailColumn: string;
  rolesColumn: string;
  usernameColumn: string;
  passwordColumn: string;
  tutorialsColumn: string;
  tutorialsToCorrectColumn: string;
}

interface CSVFormData {
  csvInput: string;
  seperator: string;
}

interface DataContextValue {
  tutorials: Tutorial[];
  data: CSVData;
  setData: (data: ParsedCSVData) => void;
  mappedColumns: MappedColumns;
  setMappedColumns: (columns: MappedColumns) => void;
  csvFormData?: CSVFormData;
  setCSVFormData: (data: CSVFormData) => void;
}

const initialMappedColumns: MappedColumns = {
  firstnameColumn: '',
  lastnameColumn: '',
  emailColumn: '',
  rolesColumn: '',
  usernameColumn: '',
  passwordColumn: '',
  tutorialsColumn: '',
  tutorialsToCorrectColumn: '',
};

const DataContext = React.createContext<DataContextValue>({
  tutorials: [],
  data: { headers: [], rows: [] },
  mappedColumns: initialMappedColumns,
  csvFormData: undefined,
  setData: throwContextNotInitialized('ImportUsersContext'),
  setMappedColumns: throwContextNotInitialized('ImportUsersContext'),
  setCSVFormData: throwContextNotInitialized('ImportUsersContext'),
});

function convertParsedToInternalCSV(data: ParsedCSVData): CSVData {
  const { headers, rows: parsedRows } = data;
  const rows: CSVDataRow[] = parsedRows.map((row, idx) => ({ rowNr: idx, data: row }));

  headers.sort((a, b) => a.localeCompare(b));
  return { headers, rows };
}

function ImportUsersContext({ children }: RequireChildrenProp): JSX.Element {
  const [data, setInternalData] = useState<CSVData>(() =>
    convertParsedToInternalCSV({ headers: [], rows: [] })
  );
  const [mappedColumns, setMappedColumns] = useState<MappedColumns>(initialMappedColumns);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [csvFormData, setCSVFormData] = useState<CSVFormData>();

  useEffect(() => {
    getAllTutorials().then((tutorials) => setTutorials(tutorials));
  }, []);

  const setData = useCallback((data: ParsedCSVData) => {
    const newData = convertParsedToInternalCSV(data);
    setInternalData(newData);
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
        tutorials,
        mappedColumns,
        setMappedColumns,
        csvFormData,
        setCSVFormData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useImportDataContext(): DataContextValue {
  const value = useContext(DataContext);

  return value;
}

export default ImportUsersContext;
