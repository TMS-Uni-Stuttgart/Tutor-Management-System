import React, { useContext, useState } from 'react';

interface CSVData {
  headers: string[];
  rows: { [header: string]: string[] };
}

interface DataContextValue {
  data: CSVData;
  setData: (data: CSVData) => void;
}

const DataContext = React.createContext<DataContextValue>({
  data: { headers: [], rows: {} },
  setData: () => {
    throw new Error('ImportDataContext not initialised.');
  },
});

// FIXME: Remove us after implementing UI for parsing CSV.
const HEADERS: string[] = ['Header 1', 'Header 2', 'Header 3', 'Header 4', 'Header 5'];

function ImportDataContext({ children }: React.PropsWithChildren<{}>): JSX.Element {
  const [data, setData] = useState<CSVData>({ headers: [...HEADERS], rows: {} });

  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
}

export function useImportDataContext(): DataContextValue {
  const value = useContext(DataContext);

  return value;
}

export default ImportDataContext;
