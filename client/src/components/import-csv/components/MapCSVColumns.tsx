import { Box, Typography } from '@material-ui/core';
import React from 'react';
import FormikDebugDisplay from '../../forms/components/FormikDebugDisplay';
import { useMapColumnsHelpers } from '../hooks/useMapColumnsHelpers';

function MapCSVColumns(): JSX.Element {
  const { mapColumnBoxes } = useMapColumnsHelpers();

  return (
    <Box display='flex' flexDirection='column' flex={1}>
      <Typography variant='h4'>Spalten zuordnen</Typography>

      {mapColumnBoxes}

      <FormikDebugDisplay showErrors />
    </Box>
  );
}

export default MapCSVColumns;
