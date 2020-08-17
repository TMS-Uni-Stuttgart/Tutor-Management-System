import { Box, Typography } from '@material-ui/core';
import React from 'react';
import FormikDebugDisplay from '../forms/components/FormikDebugDisplay';
import { useMapColumnsHelpers } from './ImportCSV.context';

function MapCSVColumns(): JSX.Element {
  const { mapColumnBoxes } = useMapColumnsHelpers();

  return (
    <Box display='flex' flexDirection='column' padding={1}>
      <Typography variant='h4'>Spalten zuordnen</Typography>

      {mapColumnBoxes}

      <FormikDebugDisplay showErrors />
    </Box>
  );
}

export default MapCSVColumns;
