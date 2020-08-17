import { Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import { getParsedCSV } from '../../hooks/fetching/CSV';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { FormikSubmitCallback } from '../../types';
import { RequireChildrenProp } from '../../typings/RequireChildrenProp';
import { throwContextNotInitialized } from '../../util/throwFunctions';
import { useMapColumnsDataElements } from './hooks/useMapColumnsDataElements';
import {
  Column,
  CSVData,
  CSVDataRow,
  CSVFormData,
  DataContextValue,
  HandleSubmit,
  MapColumnsData,
  MappedColumns,
  ParsedCSVData,
} from './ImportCSV.types';

export const DataContext = React.createContext<DataContextValue<any, any>>({
  data: { headers: [], rows: [] },
  isLoading: false,
  importCsvHelpers: {
    canSubmitCSV: false,
    csvFormData: { csvInput: '', separator: '' },
    setCSVFormData: throwContextNotInitialized('ImportUsersContext'),
    handleCSVFormSubmit: throwContextNotInitialized('ImportUsersContext'),
  },
  mapColumnsHelpers: {
    mapColumnsData: { information: {}, groups: {} },
    mappedColumns: {},
    setMappedColumns: throwContextNotInitialized('ImportUsersContext'),
    handleMappedColumnsSubmit: throwContextNotInitialized('ImportUsersContext'),
    mapColumnBoxes: [],
    isValidFormState: false,
  },
});

function convertParsedToInternalCSV(data: ParsedCSVData): CSVData {
  const { headers, rows: parsedRows } = data;
  const rows: CSVDataRow[] = parsedRows.map((row, idx) => ({ rowNr: idx, data: row }));

  headers.sort((a, b) => a.localeCompare(b));
  return { headers, rows };
}

function generateInitialMapping<COL extends string, GRP extends string>(
  data: MapColumnsData<COL, GRP>
): MappedColumns<COL> {
  const mapped: Record<string, string> = {};

  for (const key of Object.keys(data.information)) {
    mapped[key] = '';
  }

  return mapped as MappedColumns<COL>;
}

interface Props<T extends MapColumnsData<any, any>> extends RequireChildrenProp {
  mapColumnsData: T;
}

function ImportCSVContext<T extends MapColumnsData<any, any>>({
  children,
  mapColumnsData,
}: Props<T>): JSX.Element {
  const { enqueueSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();

  const [isLoading, setLoading] = useState(false);
  const [data, setInternalData] = useState<CSVData>(() =>
    convertParsedToInternalCSV({ headers: [], rows: [] })
  );
  const [mappedColumns, setMappedColumns] = useState<MappedColumns<Column<T>>>(() =>
    generateInitialMapping(mapColumnsData)
  );
  const [csvFormData, setCSVFormData] = useState<CSVFormData>({ csvInput: '', separator: '' });
  const { boxes, validationSchema } = useMapColumnsDataElements(mapColumnsData, data.headers);

  const setData = useCallback((data: ParsedCSVData) => {
    setInternalData(convertParsedToInternalCSV(data));
  }, []);

  const handleCSVFormSubmit = useCallback<HandleSubmit>(async () => {
    const { csvInput, separator } = csvFormData;

    if (!csvInput) {
      return { isSuccess: false };
    }

    let isSuccess: boolean = true;

    try {
      setLoading(true);
      const response = await getParsedCSV<{ [header: string]: string }>({
        data: csvInput.trim(),
        options: { header: true, delimiter: separator },
      });

      if (response.errors.length === 0) {
        setData({ headers: response.meta.fields, rows: response.data });

        enqueueSnackbar('CSV erfolgreich importiert.', { variant: 'success' });
      } else {
        enqueueSnackbarWithList({
          title: 'CSV konnte nicht importiert werden.',
          textBeforeList: 'Folgende Fehler sind aufgetreten:',
          items: response.errors.map((err) => `${err.message} (Zeile: ${err.row})`),
        });
        isSuccess = false;
      }
    } catch {
      enqueueSnackbar('CSV konnte nicht importiert werden.', { variant: 'error' });
      isSuccess = false;
    } finally {
      setLoading(false);
    }
    return { isSuccess };
  }, [csvFormData, setData, enqueueSnackbar, enqueueSnackbarWithList]);

  const handleMappedColumnsFormSubmit = useCallback<FormikSubmitCallback<MappedColumns<string>>>(
    async (values) => {
      // This function needs to be async so formik itself can return the returned value of this function.
      setMappedColumns(values);
      return true;
    },
    []
  );

  const handleMappedColumnsSubmit = useCallback(
    (submitForm: () => Promise<any>) => async () => {
      setLoading(true);
      const isSuccess = await submitForm();
      setLoading(false);

      return { isSuccess: !!isSuccess };
    },
    []
  );

  return (
    <Formik
      initialValues={mappedColumns}
      validationSchema={validationSchema}
      onSubmit={handleMappedColumnsFormSubmit}
    >
      {({ isValid, submitForm }) => (
        <DataContext.Provider
          value={{
            data,
            isLoading,
            importCsvHelpers: {
              csvFormData,
              canSubmitCSV: !!csvFormData.csvInput,
              setCSVFormData,
              handleCSVFormSubmit,
            },
            mapColumnsHelpers: {
              handleMappedColumnsSubmit: handleMappedColumnsSubmit(submitForm),
              mapColumnsData,
              mappedColumns,
              setMappedColumns,
              mapColumnBoxes: boxes,
              isValidFormState: isValid,
            },
          }}
        >
          {children}
        </DataContext.Provider>
      )}
    </Formik>
  );
}

export default ImportCSVContext;
