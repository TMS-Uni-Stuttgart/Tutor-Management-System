import { Divider } from '@material-ui/core';
import React from 'react';

function GridDivider(): JSX.Element {
  return <Divider style={{ gridColumn: '1 / -1' }} />;
}

export default GridDivider;
