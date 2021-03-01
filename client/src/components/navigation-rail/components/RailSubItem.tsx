import {
  createStyles,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  SvgIconProps,
  Theme,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { renderLink } from './renderLink';
import { ButtonListItemProps } from './RailItem';
import { getTargetLink } from './RailItem.helpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    currentPath: {
      color: theme.palette.secondary.main,
    },
  })
);

export interface RailSubItemProps extends ButtonListItemProps {
  subPath: string;
  icon: React.ComponentType<SvgIconProps>;
  text: string;
}

function RailSubItem({ text, subPath, icon: Icon, ...other }: RailSubItemProps): JSX.Element {
  const classes = useStyles();
  const isSubPath = useRouteMatch(subPath);

  return (
    <ListItem key={subPath + text} {...other} button component={renderLink(getTargetLink(subPath))}>
      <ListItemIcon className={clsx(isSubPath && classes.currentPath)}>
        <Icon />
      </ListItemIcon>

      <ListItemText className={clsx(isSubPath && classes.currentPath)}>{text}</ListItemText>
    </ListItem>
  );
}

export default RailSubItem;
