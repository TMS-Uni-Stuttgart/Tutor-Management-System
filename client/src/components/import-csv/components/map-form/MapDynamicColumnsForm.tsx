import { Box, Button } from '@material-ui/core';
import { FieldArray, useField } from 'formik';
import React from 'react';
import MapSelect, { MapSelectProps } from './MapSelect';

interface Props {
  name: string;
  sortedHeaders: string[];
  isColumnDisabled: MapSelectProps['isColumnDisabled'];
}

function MapDynamicColumnsForm({ name, sortedHeaders, isColumnDisabled }: Props): JSX.Element {
  const [{ value }] = useField<string[]>({ name, multiple: true });

  if (!Array.isArray(value)) {
    throw new Error(`Given value of field "${name}" is not an array.`);
  }

  return (
    <FieldArray name={name}>
      {(arrayHelpers) => (
        <Box
          display='grid'
          gridRowGap={24}
          gridColumnGap={16}
          gridTemplateColumns='repeat(auto-fill, minmax(30%, 1fr))'
        >
          {value.map((val, idx) => (
            <MapSelect
              parentName={name}
              isColumnDisabled={isColumnDisabled}
              key={val}
              idx={idx}
              sortedHeaders={sortedHeaders}
              onRemove={() => arrayHelpers.remove(idx)}
            />
          ))}

          <Button
            color='primary'
            size='large'
            style={{ height: 56 }}
            onClick={() => arrayHelpers.push('')}
            disabled={value.includes('')}
          >
            Spalte hinzufügen
          </Button>
        </Box>
      )}
    </FieldArray>
  );
}

export default MapDynamicColumnsForm;
