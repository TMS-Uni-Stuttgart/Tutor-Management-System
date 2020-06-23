import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Tutorial } from '../../model/Tutorial';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';

interface ParsedCSVDataRow {
  [header: string]: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: ParsedCSVDataRow[];
}

export interface CSVDataRow {
  id: number;
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
};

function notInitializied() {
  throw new Error('ImportDataContext not initialised.');
}

const DataContext = React.createContext<DataContextValue>({
  tutorials: [],
  data: { headers: [], rows: [] },
  mappedColumns: initialMappedColumns,
  csvFormData: undefined,
  setData: notInitializied,
  setMappedColumns: notInitializied,
  setCSVFormData: notInitializied,
});

function convertParsedToInternalCSV(data: ParsedCSVData): CSVData {
  const { headers, rows: parsedRows } = data;
  const rows: CSVDataRow[] = parsedRows.map((row, idx) => ({ id: idx, data: row }));

  return { headers, rows };
}

function ImportUsersContext({ children }: React.PropsWithChildren<{}>): JSX.Element {
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
