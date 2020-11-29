import React, { PropsWithChildren, useCallback, useContext, useState } from 'react';
import { throwContextNotInitialized } from '../../util/throwFunctions';
import { CSVData, CSVDataRow, ParsedCSVData } from '../import-csv/ImportCSV.types';
import { CSVContext, CSVMapColumnsHelpers, CSVMapColumsMetadata } from './ImportCSV.types';

const CSVImportContext = React.createContext<CSVContext<any, any>>({
  // isLoading: false,
  setCSVData: throwContextNotInitialized('CSVContext'),
  // importHelpers: {
  //   mode: ImportMode.FILE,
  //   setMode: throwContextNotInitialized('CSVContext'),
  //   setFileContent: throwContextNotInitialized('CSVContext'),
  //   setTextFieldValue: throwContextNotInitialized('CSVContext'),
  //   importCSV: throwContextNotInitialized('CSVContext'),
  // },
  mapColumnsHelpers: {
    metadata: { information: {}, groups: {} },
    mappedColumns: {},
    isValidMapping: true,
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
  const [csvData, setInternalCSVData] = useState<CSVData>();

  const setCSVData = useCallback((csvData: ParsedCSVData) => {
    // TODO: Prepare data for the mapping?!
    setInternalCSVData(convertParsedToCSVData(csvData));
  }, []);

  // TODO: Replace with real helpers!
  const mapColumnsHelpers_DUMMY = {
    metadata: { information: {}, groups: {} },
    mappedColumns: {},
    isValidMapping: true,
    mapColumn: throwContextNotInitialized('CSVContext'),
  };

  return (
    <CSVImportContext.Provider value={{ setCSVData, mapColumnsHelpers: mapColumnsHelpers_DUMMY }}>
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

// export function useCSVImport(): CSVImportHelpers {
//   const { importHelpers } = useContext(CSVImportContext);
//   return importHelpers;
// }

export function useCSVColumnMapping<COL extends string, GRP extends string>(): CSVMapColumnsHelpers<
  COL,
  GRP
> {
  const { mapColumnsHelpers } = useContext<CSVContext<COL, GRP>>(CSVImportContext);
  return mapColumnsHelpers;
}
