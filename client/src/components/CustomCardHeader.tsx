import React from 'react';
import { CardHeaderProps } from '@material-ui/core/CardHeader';
import { Typography } from '@material-ui/core';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    /* Styles applied to the root element. */
    root: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(2),
    },
    /* Styles applied to the avatar element. */
    avatar: {
      flex: '0 0 auto',
      marginRight: theme.spacing(2),
    },
    /* Styles applied to the action element. */
    action: {
      flex: '0 0 auto',
      alignSelf: 'flex-start',
      marginTop: theme.spacing(-1),
      marginRight: theme.spacing(-1),
    },
    /* Styles applied to the content wrapper element. */
    content: {
      marginLeft: theme.spacing(3),
      flex: '1 1 auto',
    },
    /* Styles applied to the title Typography element. */
    title: {},
    /* Styles applied to the subheader Typography element. */
    subheader: {},
  })
);

interface Props extends Omit<CardHeaderProps, 'component' | 'ref'> {
  midText?: string;
}

/**
 * This is a re-implementation of the MUI Cards component which allows additional content between the header title and the header action.
 */
function CustomCardHeader({
  action,
  avatar,
  className: classNameProp,
  disableTypography = false,
  subheader: subheaderProp,
  subheaderTypographyProps,
  title: titleProp,
  titleTypographyProps,
  midText,
  ...other
}: Props): JSX.Element {
  const classes = useStyles();

  let title = titleProp;
  if (title != null && !disableTypography) {
    title = (
      <Typography
        variant={avatar ? 'body2' : 'h5'}
        className={classes.title}
        component='span'
        display='block'
        {...titleTypographyProps}
      >
        {title}
      </Typography>
    );
  }

  let subheader = subheaderProp;
  if (subheader != null && !disableTypography) {
    subheader = (
      <Typography
        variant={avatar ? 'body2' : 'body1'}
        className={classes.subheader}
        color='textSecondary'
        component='span'
        display='block'
        {...subheaderTypographyProps}
      >
        {subheader}
      </Typography>
    );
  }

  return (
    <div className={clsx(classes.root, classNameProp)} {...other}>
      {avatar && <div className={classes.avatar}>{avatar}</div>}

      <div>
        {title}
        {subheader}
      </div>

      <div className={classes.content}>
        <Typography
          variant={avatar ? 'body2' : 'body1'}
          className={classes.subheader}
          color='textPrimary'
          component='span'
          display='block'
        >
          {midText}
        </Typography>
      </div>

      {action && <div className={classes.action}>{action}</div>}
    </div>
  );
}

export default CustomCardHeader;
