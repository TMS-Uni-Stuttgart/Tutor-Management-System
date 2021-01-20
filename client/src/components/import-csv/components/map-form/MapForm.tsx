import { Box } from '@material-ui/core';
import { Formik, FormikProps } from 'formik';
import React, { RefObject, useCallback, useMemo } from 'react';
import { FormikSubmitCallback } from '../../../../types';
import { IsItemDisabledFunction } from '../../../CustomSelect';
import FormikDebugDisplay from '../../../forms/components/FormikDebugDisplay';
import FormikSelect from '../../../forms/components/FormikSelect';
import { CSVMapColumsMetadata } from '../../ImportCSV.types';
import MapBox from './MapBox';
import MapDynamicColumnsForm from './MapDynamicColumnsForm';
import MapDynamicSettingsForm from './MapDynamicSettingsForm';
import {
  DynamicBoxData,
  generateInitialValues,
  getDynamicData,
  groupStaticData,
  StaticBoxGroup,
} from './MapForm.helpers';

export type MapFormValues = Record<string, string | string[]>;
export type Metadata = CSVMapColumsMetadata<string, string>;

interface Props {
  headers: string[];
  metadata: Metadata;
  onSubmit: FormikSubmitCallback<MapFormValues>;
  formikRef?: RefObject<FormikProps<MapFormValues>>;
}

function MapForm({ headers, metadata, formikRef, onSubmit }: Props): JSX.Element {
  const initialValues: MapFormValues = useMemo(() => generateInitialValues(metadata, headers), [
    metadata,
    headers,
  ]);
  const staticDataByBoxes: StaticBoxGroup[] = useMemo(() => groupStaticData(metadata), [metadata]);
  const dynamicData: DynamicBoxData[] = useMemo(() => getDynamicData(metadata), [metadata]);
  const sortedHeaders = useMemo(() => [...headers].sort((a, b) => a.localeCompare(b)), [headers]);

  const isColumnDisabled: IsItemDisabledFunction<string> = useCallback(
    (col) => {
      const values = formikRef?.current?.values;

      if (!values) {
        return { isDisabled: false };
      }

      const formValues: (string | string[])[] = Object.values(values);

      for (const val of formValues) {
        if (Array.isArray(val) && val.includes(col)) {
          return { isDisabled: true, reason: 'Bereits ausgewählt.' };
        } else if (val === col) {
          return { isDisabled: true, reason: 'Bereits  ausgewählt.' };
        }
      }

      return { isDisabled: false };
    },
    [formikRef]
  );

  return (
    <Formik
      innerRef={formikRef}
      onSubmit={onSubmit}
      initialValues={initialValues}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Box display='grid' gridTemplateColumns='1fr' gridRowGap={16} marginTop={2}>
          {staticDataByBoxes.map((data) => (
            <MapBox key={data.key} title={data.title}>
              <Box
                display='grid'
                gridColumn='1fr'
                gridAutoRows='auto'
                gridAutoFlow='row'
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
                    isItemDisabled={isColumnDisabled}
                    emptyPlaceholder='Keine Überschriften verfügbar.'
                  />
                ))}
              </Box>
            </MapBox>
          ))}

          {dynamicData.map((data) => (
            <MapBox key={data.key} title={data.title}>
              {values[data.key].length > 0 ? (
                <MapDynamicColumnsForm
                  name={data.key}
                  sortedHeaders={sortedHeaders}
                  isColumnDisabled={isColumnDisabled}
                />
              ) : (
                <MapDynamicSettingsForm
                  headerCount={headers.length}
                  onSubmit={({ count, selectionMode }) => {
                    const subHeaders =
                      selectionMode === 'last' ? headers.slice(-count) : headers.slice(0, count);

                    setFieldValue(data.key, [...subHeaders]);
                  }}
                />
              )}
            </MapBox>
          ))}

          <FormikDebugDisplay />
        </Box>
      )}
    </Formik>
  );
}

export default MapForm;
