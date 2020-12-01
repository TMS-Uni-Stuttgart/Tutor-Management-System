import { Box, Typography } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import CustomSelect from '../../CustomSelect';
import OutlinedBox from '../../OutlinedBox';
import {
  CSVMapColumsMetadata,
  CSVStaticColumnInformation,
  isDynamicColumnInformation,
} from '../ImportCSV.types';

interface Props {
  headers: string[];
  metadata: CSVMapColumsMetadata<string, string>;
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

function MapForm({ headers, metadata }: Props): JSX.Element {
  const [values, setValues] = useState<Record<string, string | string[]>>(() => {
    const values: Record<string, string | string[]> = {};

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
  });

  const sortedHeaders = useMemo(() => [...headers].sort((a, b) => a.localeCompare(b)), [headers]);
  const dataGroupedByBoxes: BoxGroup[] = useMemo(() => {
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
  }, [metadata]);

  return (
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
              <CustomSelect
                key={key}
                name={key}
                label={label}
                required={required}
                helperText={helperText}
                nameOfNoneItem={!required ? 'Keine Spalte auswählen.' : undefined}
                items={sortedHeaders}
                itemToValue={(i) => i}
                itemToString={(i) => i}
                value={values[key] ?? ''}
                onChange={(e) => {
                  setValues({ ...values, [key]: e.target.value as string });
                }}
                emptyPlaceholder='Keine Überschriften verfügbar.'
              />
            ))}
          </Box>
        </OutlinedBox>
      ))}
    </Box>
  );
}

export default MapForm;
