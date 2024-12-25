import { Box, BoxProps } from '@mui/material';
import React, { PropsWithChildren } from 'react';

function OutlinedBox({ children, ...boxProps }: PropsWithChildren<BoxProps>): JSX.Element {
  return (
    <Box border={1} borderColor='divider' borderRadius={1} padding={1} {...boxProps}>
      {children}
    </Box>
  );
}

export default OutlinedBox;
