import { Typography } from '@material-ui/core';
import React, { PropsWithChildren } from 'react';
import OutlinedBox from '../../../OutlinedBox';

interface Props {
  title: string;
}

function MapBox({ children, title }: PropsWithChildren<Props>): JSX.Element {
  return (
    <OutlinedBox display='flex' flexDirection='column' paddingX={1.5} paddingY={1} gridRowGap={8}>
      <Typography variant='h6' style={{ marginBottom: 16 }}>
        {title}
      </Typography>

      {children}
    </OutlinedBox>
  );
}

export default MapBox;
