import { Box } from '@material-ui/core';
import React from 'react';
import { useImportCSVContext } from '../../../components/import-csv-new/ImportCSV.context';

function AdjustGeneratedShortTest(): JSX.Element {
  const {
    mapColumnsHelpers: { mappedColumns },
  } = useImportCSVContext();

  // TODO: Re-Implement me.
  return (
    <Box>
      <code style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(mappedColumns, null, 2)}</code>
    </Box>
  );
}

export default AdjustGeneratedShortTest;
