import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    ratioWrapper: {
      '&-16-9': {
        width: '100%',
        paddingTop: '56.25%',
        position: 'relative',
      },
      '&-48-9': {
        width: '100%',
        paddingTop: '18.75%',
        position: 'relative',
      },
    },
    ratioContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      '& > div': {
        height: '100%',
      },
    },
  })
);

export interface AspectRatioProps {
  ratio: string;
  children: React.ReactNode;
}

function AspectRatio({ ratio, children }: AspectRatioProps): JSX.Element {
  const classes = useStyles({ ratio });

  return (
    <div className={classes.ratioWrapper + '-' + ratio}>
      <div className={classes.ratioContent}>{children}</div>
    </div>
  );
}

export default AspectRatio;
