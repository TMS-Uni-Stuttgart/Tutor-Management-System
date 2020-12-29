import { Box, Typography } from '@material-ui/core';
import { Formik, FormikProps } from 'formik';
import React, { useMemo } from 'react';
import { FormikSubmitCallback } from '../../../types';
import FormikDebugDisplay from '../../forms/components/FormikDebugDisplay';
import FormikSelect from '../../forms/components/FormikSelect';
import OutlinedBox from '../../OutlinedBox';
import { CSVMapColumsMetadata } from '../ImportCSV.types';
import { BoxGroup, generateInitialValues, groupData } from './MapForm.helpers';

export type MapFormValues = Record<string, string | string[]>;
export type Metadata = CSVMapColumsMetadata<string, string>;

interface Props {
  headers: string[];
  metadata: Metadata;
  onSubmit: FormikSubmitCallback<MapFormValues>;
  formikRef?: React.Ref<FormikProps<MapFormValues>>;
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
