import { Box, createStyles, makeStyles, Typography } from '@material-ui/core';
import { Formik } from 'formik';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import * as Yup from 'yup';
import { getParsedCSV } from '../../hooks/fetching/CSV';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import { FormikSubmitCallback } from '../../types';
import { RequireChildrenProp } from '../../typings/RequireChildrenProp';
import { throwContextNotInitialized } from '../../util/throwFunctions';
import FormikSelect from '../forms/components/FormikSelect';
import OutlinedBox from '../OutlinedBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      minWidth: 210,
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  })
);

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

interface CSVFormData {
  csvInput: string;
  separator: string;
}

type HandleSubmit = () => Promise<{ isSuccess: boolean }>;

interface ImportCSVHelpers {
  csvFormData: CSVFormData;
  setCSVFormData: (data: CSVFormData) => void;
  handleCSVFormSubmit: HandleSubmit;
  canSubmitCSV: boolean;
}

interface MapColumnsHelpers<COL extends string, GRP extends string> {
  mapColumnsData: MapColumnsData<COL, GRP>;
  mappedColumns: MappedColumns<COL>;
  setMappedColumns: (columns: MappedColumns<COL>) => void;
  handleMappedColumnsSubmit: HandleSubmit;
  mapColumnBoxes: JSX.Element[];
  isValidFormState: boolean;
}

interface DataContextValue<COL extends string, GRP extends string> {
  data: CSVData;
  isLoading: boolean;
  importCsvHelpers: ImportCSVHelpers;
  mapColumnsHelpers: MapColumnsHelpers<COL, GRP>;
}

interface MapColumnsInformation<G extends string> {
  /** Label to show to the user. */
  label: string;
  /** Used internally to try and auto-match the CSV columns without user interaction. */
  mapName: string[];
  /** Used to visually group related labels. */
  group: G;
  /** Marks the corresponding field as required */
  required?: boolean;
}

interface MapColumnsGroup {
  /** Name of the group shown to the user. */
  name: string;
  /** The lower the index the higher up in the UI the group will be displayed */
  index: number;
}

export type MapColumnsData<COL extends string, GRP extends string> = {
  /** Information about the columns to map. */
  information: {
    [key in COL]: MapColumnsInformation<GRP>;
  };
  /** Information about the visual groups. */
  groups: {
    [key in GRP]: MapColumnsGroup;
  };
};

export type MappedColumns<COL extends string> = {
  [key in COL]: string;
};

const DataContext = React.createContext<DataContextValue<any, any>>({
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

type Column<T> = T extends MapColumnsData<infer COL, any> ? COL : never;

interface UseMapColumnsDataElements {
  boxes: JSX.Element[];
  validationSchema: Yup.ObjectSchema;
}

function useMapColumnsDataElements(
  mapColumnsData: MapColumnsData<any, any>,
  headers: string[]
): UseMapColumnsDataElements {
  const { information, groups } = mapColumnsData;
  const classes = useStyles();

  const { boxesByGroup, validationShape } = useMemo(() => {
    const validationShape: Yup.ObjectSchemaDefinition<Record<string, unknown>> = {};
    const boxesByGroup: { [key: string]: JSX.Element[] } = {};

    for (const [key, value] of Object.entries(information)) {
      if (!boxesByGroup[value.group]) {
        boxesByGroup[value.group] = [];
      }

      if (value.required) {
        validationShape[key] = Yup.string().required('Benötigt.');
      }

      boxesByGroup[value.group].push(
        <FormikSelect
          key={key}
          name={key}
          label={value.label}
          required={value.required}
          nameOfNoneItem={!value.required ? 'Keine Spalte auswählen' : undefined}
          items={headers}
          itemToValue={(i) => i}
          itemToString={(i) => i}
          emptyPlaceholder='Keine Überschriften verfügbar'
          className={classes.select}
        />
      );
    }

    return { boxesByGroup, validationShape };
  }, [classes.select, headers, information]);

  const boxes: JSX.Element[] = useMemo(() => {
    const generatedBoxes: JSX.Element[] = [];

    for (const [key, value] of Object.entries(groups)) {
      const boxesOfGroup = boxesByGroup[key] ?? [];

      generatedBoxes.push(
        <OutlinedBox key={key} display='flex' flexDirection='column' marginTop={2}>
          <Typography variant='h6'>{value.name}</Typography>
          <Box display='flex' flexWrap='wrap' marginTop={1}>
            {boxesOfGroup}
          </Box>
        </OutlinedBox>
      );
    }

    return generatedBoxes;
  }, [groups, boxesByGroup]);

  return { boxes, validationSchema: Yup.object().shape(validationShape) };
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

export function useImportCSVHelpers(): ImportCSVHelpers & { isLoading: boolean } {
  const { isLoading, importCsvHelpers } = useContext(DataContext);
  return { isLoading, ...importCsvHelpers };
}

export function useMapColumnsHelpers<COL extends string, GRP extends string>(): MapColumnsHelpers<
  COL,
  GRP
> & { isLoading: boolean; data: CSVData } {
  const { data, isLoading, mapColumnsHelpers } = useContext<DataContextValue<COL, GRP>>(
    DataContext
  );
  return { data, isLoading, ...mapColumnsHelpers };
}

export default ImportCSVContext;
