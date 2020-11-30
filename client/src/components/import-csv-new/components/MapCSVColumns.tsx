import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Formik, FormikProps } from 'formik';
import React, { useMemo, useRef } from 'react';
import * as Yup from 'yup';
import FormikDebugDisplay from '../../forms/components/FormikDebugDisplay';
import FormikSelect from '../../forms/components/FormikSelect';
import OutlinedBox from '../../OutlinedBox';
import { useImportCSVContext } from '../ImportCSV.context';
import { CSVMapColumsMetadata, isDynamicColumnInformation } from '../ImportCSV.types';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      rowGap: theme.spacing(2),
    },
  })
);

type FormProps = Record<string, string>;

interface UseMapFormParams {
  headers: string[];
  metadata: CSVMapColumsMetadata<string, string>;
}

interface UseMapForm {
  formContent: JSX.Element[];
  validationSchema: Yup.ObjectSchema;
  initialValues: Record<string, string>;
}

function useMapForm({ headers, metadata }: UseMapFormParams): UseMapForm {
  const sortedHeaders = useMemo(() => [...headers].sort((a, b) => a.localeCompare(b)), [headers]);

  const { boxesByGroup, initialValues, validationShape } = useMemo(() => {
    const validationShape: Yup.ObjectSchemaDefinition<Record<string, unknown>> = {};
    const boxesByGroup: { [key: string]: JSX.Element[] } = {};
    const initialValues: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata.information)) {
      if (isDynamicColumnInformation(value)) {
        // TODO: Dynamic case!
      } else {
        if (!boxesByGroup[value.group]) {
          boxesByGroup[value.group] = [];
        }

        if (value.required) {
          validationShape[key] = Yup.string().required('Benötigt.');
        }

        const helperText =
          value.headersToAutoMap.length > 0
            ? `Spalten für Auto-Zuordnung: ${value.headersToAutoMap.join(', ')}`
            : 'Kein Auto-Zuordnung möglich.';

        headers.forEach((header) => {
          if (value.headersToAutoMap.includes(header)) {
            initialValues[key] = header;
          }
        });

        boxesByGroup[value.group].push(
          <FormikSelect
            key={key}
            name={key}
            label={value.label}
            required={value.required}
            helperText={helperText}
            nameOfNoneItem={!value.required ? 'Keine Spalte auswählen' : undefined}
            items={sortedHeaders}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
          />
        );
      }
    }

    return { initialValues, boxesByGroup, validationShape };
  }, [metadata, sortedHeaders, headers]);

  const formContent: JSX.Element[] = useMemo(() => {
    const formContent: JSX.Element[] = [];

    for (const [key, value] of Object.entries(metadata.groups)) {
      const boxesOfGroup = boxesByGroup[key] ?? [];

      formContent.push(
        <OutlinedBox
          key={key}
          display='flex'
          flexDirection='column'
          marginTop={2}
          paddingX={1.5}
          paddingY={1}
          gridRowGap={8}
        >
          <Typography variant='h6'>{value.name}</Typography>

          <Box
            display='grid'
            gridColumn='1fr'
            gridAutoRows='auto'
            gridAutoFlow='row'
            marginTop={1}
            gridRowGap={24}
            gridColumnGap={8}
          >
            {boxesOfGroup}
          </Box>
        </OutlinedBox>
      );
    }

    return formContent;
  }, [boxesByGroup, metadata]);

  return { formContent, initialValues, validationSchema: Yup.object().shape(validationShape) };
}

function MapCSVColumns(): JSX.Element {
  const classes = useStyles();
  const { csvData, mapColumnsHelpers } = useImportCSVContext();
  const { metadata } = mapColumnsHelpers;

  // We save a ref on the form data to be able to use the submit function with the Stepper but without creating a wrapper component.
  const formInstance = useRef<FormikProps<FormProps> | null>();

  const { formContent, validationSchema, initialValues } = useMapForm({
    headers: csvData.headers,
    metadata,
  });

  return (
    <Box width='100%'>
      <Typography variant='h4'>Spalten zuordnen</Typography>

      <Formik<FormProps>
        innerRef={(instance: FormikProps<FormProps> | null) => {
          formInstance.current = instance;
        }}
        enableReinitialize
        initialValues={initialValues}
        onSubmit={() => {}}
        validationSchema={validationSchema}
      >
        {({ handleSubmit }) => (
          <form className={classes.form} onSubmit={handleSubmit}>
            {formContent}

            <FormikDebugDisplay />
          </form>
        )}
      </Formik>
    </Box>
  );
}

export default MapCSVColumns;
