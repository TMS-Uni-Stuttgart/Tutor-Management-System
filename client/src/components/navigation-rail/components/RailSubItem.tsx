import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  SvgIconProps,
  Theme,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { useMatch } from 'react-router';
import { getTargetLink } from './RailItem.helpers';
import { renderLink } from './renderLink';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    currentPath: {
      color: theme.palette.secondary.main,
    },
  })
);

export interface RailSubItemProps extends ListItemProps<'li', {}> {
  subPath: string;
  subPathTemplate: string;
  icon: React.ComponentType<SvgIconProps>;
  text: string;
}

function RailSubItem({
  text,
  subPath,
  subPathTemplate,
  icon: Icon,
  ...other
}: RailSubItemProps): JSX.Element {
  const classes = useStyles();
  const isSubPath = useMatch(subPath);

  return (
    <ListItem key={subPath + text} {...other} disablePadding>
      <ListItemButton component={renderLink(getTargetLink(subPath))}>
        <ListItemIcon className={clsx(isSubPath && classes.currentPath)}>
          <Icon />
        </ListItemIcon>
        <ListItemText className={clsx(isSubPath && classes.currentPath)}>{text}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
}

export default RailSubItem;
