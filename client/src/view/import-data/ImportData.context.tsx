import React, { useContext, useState, useEffect } from 'react';
import { Tutorial } from '../../model/Tutorial';
import { getAllTutorials } from '../../hooks/fetching/Tutorial';

interface ParsedCSVDataRow {
  [header: string]: string;
}

interface ParsedCSVData {
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

// FIXME: Remove us after implementing UI for parsing CSV.
const ROWS: ParsedCSVData['rows'] = [
  {
    'Header 1': 'C11',
    'Header 2': 'C21',
    'Header 3': 'C31',
    'Header 4': 'C41',
    'Header 5': 'C51',
    'Header 6': 'C61',
  },
  {
    'Header 1': 'C12',
    'Header 2': 'C22',
    'Header 3': 'C32',
    'Header 4': 'C42',
    'Header 5': 'C52',
    'Header 6': 'C62',
  },
  {
    'Header 1': 'C13',
    'Header 2': 'C23',
    'Header 3': 'C33',
    'Header 4': 'C43',
    'Header 5': 'C53',
    'Header 6': 'C63',
  },
  {
    'Header 1': 'C14',
    'Header 2': 'C24',
    'Header 3': 'C34',
    'Header 4': 'C44',
    'Header 5': 'C54',
    'Header 6': 'C64',
  },
];
const HEADERS: string[] = Object.keys(ROWS[0] ?? {});

function convertParsedToInternalCSV(data: ParsedCSVData): CSVData {
  const { headers, rows: parsedRows } = data;
  const rows: CSVDataRow[] = parsedRows.map((row, idx) => ({ id: idx, data: row }));

  return { headers, rows };
}

function ImportDataContext({ children }: React.PropsWithChildren<{}>): JSX.Element {
  const [data, setInternalData] = useState<CSVData>(() =>
    convertParsedToInternalCSV({ headers: HEADERS, rows: ROWS })
  );
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    console.log('FETCHING TUTORIALS');

    getAllTutorials().then((tutorials) => setTutorials(tutorials));
  }, []);

  const setData = (data: ParsedCSVData) => {
    const newData = convertParsedToInternalCSV(data);
    setInternalData(newData);
  };

  return (
    <DataContext.Provider value={{ data, setData, tutorials }}>{children}</DataContext.Provider>
  );
}

export function useImportDataContext(): DataContextValue {
  const value = useContext(DataContext);

  return value;
}

export default ImportDataContext;
