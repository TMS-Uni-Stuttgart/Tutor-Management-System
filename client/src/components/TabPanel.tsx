import { Box, BoxProps } from '@material-ui/core';
import React from 'react';

interface TabPanelProps extends BoxProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel({ value, index, children, ...props }: TabPanelProps): JSX.Element | null {
  return value === index ? (
    <Box padding={2} {...props}>
      {children}
    </Box>
  ) : null;
}

export default TabPanel;
