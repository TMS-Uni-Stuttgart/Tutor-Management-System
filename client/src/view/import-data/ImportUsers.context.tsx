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

interface DataContextValue {
  tutorials: Tutorial[];
  data: CSVData;
  setData: (data: ParsedCSVData) => void;
}

const DataContext = React.createContext<DataContextValue>({
  tutorials: [],
  data: { headers: [], rows: [] },
  setData: () => {
    throw new Error('ImportDataContext not initialised.');
  },
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
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    getAllTutorials().then((tutorials) => setTutorials(tutorials));
  }, []);

  const setData = useCallback((data: ParsedCSVData) => {
    const newData = convertParsedToInternalCSV(data);
    setInternalData(newData);
  }, []);

  return (
    <DataContext.Provider value={{ data, setData, tutorials }}>{children}</DataContext.Provider>
  );
}

export function useImportDataContext(): DataContextValue {
  const value = useContext(DataContext);

  return value;
}

export default ImportUsersContext;
