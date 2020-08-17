import { Box, createStyles, makeStyles, Typography } from '@material-ui/core';
import React, { useMemo } from 'react';
import * as Yup from 'yup';
import FormikSelect from '../../forms/components/FormikSelect';
import OutlinedBox from '../../OutlinedBox';
import { MapColumnsData } from '../ImportCSV.types';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      minWidth: 210,
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  })
);

interface UseMapColumnsDataElements {
  boxes: JSX.Element[];
  validationSchema: Yup.ObjectSchema;
}

export function useMapColumnsDataElements(
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

      const helperText =
        value.headersToAutoMap.length > 0
          ? `Spalten für Auto-Zuordnung: ${value.headersToAutoMap.join(', ')}`
          : 'Kein Auto-Zuordnung möglich.';

      boxesByGroup[value.group].push(
        <FormikSelect
          key={key}
          name={key}
          label={value.label}
          required={value.required}
          helperText={helperText}
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
