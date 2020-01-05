import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { ListItemProps } from '@material-ui/core/ListItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import clsx from 'clsx';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { renderLink } from './renderLink';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    currentPath: {
      color: theme.palette.secondary.main,
    },
  })
);

interface DrawerListItemProps extends ListItemProps {
  path: string;
  icon: React.ComponentType<SvgIconProps>;
  text: string;
}

function getTargetLink(path: string): string {
  if (!path.endsWith('?')) {
    return path;
  }

  const idx = path.lastIndexOf('/');

  return path.substring(0, idx);
}

function DrawerListItem({ path, icon: Icon, text, ...other }: DrawerListItemProps): JSX.Element {
  const classes = useStyles();
  const isCurrentPath = useRouteMatch(path);

  return (
    <ListItem {...other} button component={renderLink(getTargetLink(path))}>
      <ListItemIcon className={clsx(isCurrentPath && classes.currentPath)}>
        <Icon />
      </ListItemIcon>
      <ListItemText>{text}</ListItemText>
    </ListItem>
  );
}

export default DrawerListItem;
