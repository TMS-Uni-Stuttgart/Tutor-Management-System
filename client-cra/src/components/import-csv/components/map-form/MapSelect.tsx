import { Box, Button, IconButton } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MinusBox as RemoveIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { ItemDisabledInformation } from '../../../CustomSelect';
import FormikSelect from '../../../forms/components/FormikSelect';

const useStyles = makeStyles((theme) =>
  createStyles({
    deleteButton: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.dark,
    },
  })
);

export interface MapSelectProps {
  parentName: string;
  idx: number;
  sortedHeaders: string[];
  isColumnDisabled: (i: string) => ItemDisabledInformation;
  onRemove: () => void;
}

function MapSelect({
  parentName,
  idx,
  sortedHeaders,
  onRemove,
  isColumnDisabled,
}: MapSelectProps): JSX.Element {
  const classes = useStyles();
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);

  return showRemoveOverlay ? (
    <Box display='grid' gridTemplateColumns='1fr 1fr' gridColumnGap={8}>
      <Button
        endIcon={<RemoveIcon color='error' />}
        onClick={() => onRemove()}
        className={classes.deleteButton}
      >
        Entfernen
      </Button>
      <Button onClick={() => setShowRemoveOverlay(false)}>Abbrechen</Button>
    </Box>
  ) : (
    <FormikSelect
      name={`${parentName}.${idx}`}
      label={`Aufgabe ${(idx + 1).toString().padStart(2, '0')}`}
      items={sortedHeaders}
      itemToValue={(i) => i}
      itemToString={(i) => i}
      isItemDisabled={isColumnDisabled}
      emptyPlaceholder='Keine Überschriften verfügbar.'
      fullWidth
      endAdornment={
        <IconButton
          size='small'
          style={{ right: 32, position: 'absolute' }}
          onClick={() => {
            if (!showRemoveOverlay) {
              setShowRemoveOverlay(true);
            }
          }}
        >
          <RemoveIcon color='error' />
        </IconButton>
      }
    />
  );
}

export default MapSelect;
