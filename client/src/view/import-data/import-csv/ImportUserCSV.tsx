import { Box, TextField, Typography } from '@material-ui/core';
import React from 'react';

function ImportUserCSV(): JSX.Element {
  return (
    <Box display='flex' flexDirection='column' width='100%'>
      <Box display='flex' marginBottom={2} alignItems='center'>
        <Typography variant='h4'>CSV importieren</Typography>

        {/* TODO: Oder Dropdown-Box? */}
        <TextField
          variant='outlined'
          label='Seperator'
          placeholder='Auto'
          style={{ marginLeft: 'auto' }}
        />
      </Box>

      <TextField
        variant='outlined'
        label='CSV Daten'
        placeholder='CSV hier einfügen'
        inputProps={{ rowsMin: 8 }}
        fullWidth
        multiline
      />
    </Box>
  );
}

export default ImportUserCSV;
