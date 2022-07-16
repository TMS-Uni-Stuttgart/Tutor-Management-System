import React, { PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import { throwContextNotInitialized } from '../../util/throwFunctions';
import {
  CSVContext,
  CSVData,
  CSVDataRow,
  CSVMapColumsMetadata,
  ParsedCSVData,
} from './ImportCSV.types';

const CSVImportContext = React.createContext<CSVContext<any, any>>({
  csvData: { headers: [], rows: [] },
  setCSVData: throwContextNotInitialized('CSVContext'),
  mapColumnsHelpers: {
    metadata: { information: {}, groups: {} },
    mappedColumns: {},
    mapColumn: throwContextNotInitialized('CSVContext'),
  },
});

interface ProviderProps<COL extends string, GRP extends string> {
  groupMetadata: CSVMapColumsMetadata<COL, GRP>;
}

function convertParsedToCSVData(data: ParsedCSVData): CSVData {
  const { headers, rows: parsedRows } = data;
  const rows: CSVDataRow[] = parsedRows.map((row, idx) => ({ rowNr: idx, data: row }));

  return { headers, rows };
}

export function CSVImportProvider<COL extends string, GRP extends string>({
  children,
  groupMetadata,
}: PropsWithChildren<ProviderProps<COL, GRP>>): JSX.Element {
  const [csvData, setInternalCSVData] = useState<CSVData>({ headers: [], rows: [] });
  const [mappedColumns, setMappedColumns] = useState<Record<string, string | string[]>>({});
  const metadata = useMemo(() => ({ ...groupMetadata }), [groupMetadata]);

  const setCSVData = useCallback((csvData: ParsedCSVData) => {
    setInternalCSVData(convertParsedToCSVData(csvData));
  }, []);

  const mapColumn = useCallback((key: string, value: string | string[]) => {
    setMappedColumns((mappedColumns) => ({ ...mappedColumns, [key]: value }));
  }, []);

  return (
    <CSVImportContext.Provider
      value={{
        csvData,
        setCSVData,
        mapColumnsHelpers: { metadata, mappedColumns, mapColumn },
      }}
    >
      {children}
    </CSVImportContext.Provider>
  );
}

export function useImportCSVContext<COL extends string, GRP extends string>(): CSVContext<
  COL,
  GRP
> {
  return useContext(CSVImportContext);
}
