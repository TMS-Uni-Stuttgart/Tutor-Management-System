import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { ListItemProps } from '@material-ui/core/ListItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import clsx from 'clsx';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { renderLink } from './renderLink';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    currentPath: {
      color: theme.palette.secondary.main,
    },
  })
);

interface DrawerListItemProps extends ListItemProps, RouteComponentProps {
  path: string;
  icon: React.ComponentType<SvgIconProps>;
  text: string;
}

function DrawerListItem({
  path,
  icon: Icon,
  text,
  history,
  location,
  match,
  staticContext,
  ...other
}: DrawerListItemProps): JSX.Element {
  const classes = useStyles();
  const currentPath = location.pathname;
  const isCurrentPath = currentPath.includes(path);

  return (
    <ListItem {...other} button component={renderLink(path)}>
      <ListItemIcon className={clsx(isCurrentPath && classes.currentPath)}>
        <Icon />
      </ListItemIcon>
      <ListItemText>{text}</ListItemText>
    </ListItem>
  );
}

export default withRouter(DrawerListItem);
