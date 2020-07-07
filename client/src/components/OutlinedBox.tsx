import { Box, BoxProps } from '@material-ui/core';
import React, { PropsWithChildren } from 'react';

function OutlinedBox({ children, ...boxProps }: PropsWithChildren<BoxProps>): JSX.Element {
  return (
    <Box border={1} borderColor='divider' borderRadius='borderRadius' padding={1} {...boxProps}>
      {children}
    </Box>
  );
}

export default OutlinedBox;
