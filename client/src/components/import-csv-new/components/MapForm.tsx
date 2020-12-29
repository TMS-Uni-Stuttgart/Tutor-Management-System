import { Box, Typography } from '@material-ui/core';
import { Formik, FormikProps } from 'formik';
import React, { useMemo } from 'react';
import { FormikSubmitCallback } from '../../../types';
import FormikDebugDisplay from '../../forms/components/FormikDebugDisplay';
import FormikSelect from '../../forms/components/FormikSelect';
import OutlinedBox from '../../OutlinedBox';
import {
  CSVMapColumsMetadata,
  CSVStaticColumnInformation,
  isDynamicColumnInformation,
} from '../ImportCSV.types';

export type MapFormValues = Record<string, string | string[]>;
type Metadata = CSVMapColumsMetadata<string, string>;

interface Props {
  headers: string[];
  metadata: Metadata;
  onSubmit: FormikSubmitCallback<MapFormValues>;
  formikRef?: React.Ref<FormikProps<MapFormValues>>;
}

interface BoxData {
  key: string;
  label: string;
  required: boolean;
  helperText: string;
}

interface BoxGroup {
  key: string;
  title: string;
  boxData: BoxData[];
}

function generateInitialValues(metadata: Metadata, headers: string[]): MapFormValues {
  const values: MapFormValues = {};

  for (const [key, value] of Object.entries(metadata.information)) {
    if (isDynamicColumnInformation(value)) {
      // TODO: Dynamic case!
    } else {
      values[key] = '';

      headers.forEach((header) => {
        if (value.headersToAutoMap.includes(header)) {
          values[key] = header;
        }
      });
    }
  }

  return values;
}

function groupData(metadata: Metadata): BoxGroup[] {
  const groups: BoxGroup[] = [];
  const entries = Object.entries(metadata.groups).sort(([, a], [, b]) => b.index - a.index);

  for (const [key, value] of entries) {
    const columns = Object.entries(metadata.information).filter(function (
      entry
    ): entry is [string, CSVStaticColumnInformation<string>] {
      const [, info] = entry;
      return !isDynamicColumnInformation(info) && info.group === key;
    });
    const boxData: BoxData[] = [];

    columns.forEach(([key, column]) => {
      const helperText =
        column.headersToAutoMap.length > 0
          ? `Spalten für Auto-Zuordnung: ${column.headersToAutoMap.join(', ')}`
          : 'Kein Auto-Zuordnung möglich.';

      boxData.push({
        key,
        label: column.label,
        required: !!column.required,
        helperText,
      });
    });

    groups.push({ key, title: value.name, boxData });
  }

  return groups;
}

function MapForm({ headers, metadata, formikRef, onSubmit }: Props): JSX.Element {
  const initialValues: MapFormValues = useMemo(() => generateInitialValues(metadata, headers), [
    metadata,
    headers,
  ]);
  const dataGroupedByBoxes: BoxGroup[] = useMemo(() => groupData(metadata), [metadata]);
  const sortedHeaders = useMemo(() => [...headers].sort((a, b) => a.localeCompare(b)), [headers]);

  return (
    <Formik
      innerRef={formikRef}
      onSubmit={onSubmit}
      initialValues={initialValues}
      enableReinitialize
    >
      {() => (
        <Box display='grid' gridTemplateColumns='1fr' gridRowGap={16}>
          {dataGroupedByBoxes.map((data) => (
            <OutlinedBox
              key={data.key}
              display='flex'
              flexDirection='column'
              marginTop={2}
              paddingX={1.5}
              paddingY={1}
              gridRowGap={8}
            >
              <Typography variant='h6'>{data.title}</Typography>

              <Box
                display='grid'
                gridColumn='1fr'
                gridAutoRows='auto'
                gridAutoFlow='row'
                marginTop={1}
                gridRowGap={28}
                gridColumnGap={8}
              >
                {data.boxData.map(({ key, label, required, helperText }) => (
                  <FormikSelect
                    key={key}
                    name={key}
                    label={label}
                    required={required}
                    helperText={helperText}
                    nameOfNoneItem={!required ? 'Keine Spalte auswählen.' : undefined}
                    items={sortedHeaders}
                    itemToValue={(i) => i}
                    itemToString={(i) => i}
                    emptyPlaceholder='Keine Überschriften verfügbar.'
                  />
                ))}
              </Box>
            </OutlinedBox>
          ))}

          <FormikDebugDisplay />
        </Box>
      )}
    </Formik>
  );
}

export default MapForm;
