import {
  createStyles,
  ListItem,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  makeStyles,
  Paper,
  Popper,
  SvgIconProps,
  Theme,
  Typography,
} from '@material-ui/core';
import clsx from 'clsx';
import { ChevronRight } from 'mdi-material-ui';
import React, { MouseEventHandler, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { renderLink } from '../../../components/drawer/components/renderLink';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    currentPath: {
      color: theme.palette.secondary.main,
    },
    text: {
      display: 'flex',
      flex: 1,
    },
    menuIcon: {
      marginLeft: 'auto',
    },
    popper: {
      zIndex: theme.zIndex.drawer + 10,
    },
    popperPaper: {
      border: `1px solid ${theme.palette.divider}`,
      borderTopLeftRadius: 'unset',
      borderBottomLeftRadius: 'unset',
    },
  })
);

type ButtonListItemProps = ListItemProps<'div', { button?: true }>;

export interface RailSubItem extends ButtonListItemProps {
  subPath: string;
  icon: React.ComponentType<SvgIconProps>;
  text: string;
}

interface RailItemProps extends ButtonListItemProps {
  path: string;
  icon: React.ComponentType<SvgIconProps>;
  text: string;
  subItems?: RailSubItem[];
}

interface RootItemProps extends ButtonListItemProps {
  hasSubItems: boolean;
  path: string;
  onMouseEnter: MouseEventHandler<HTMLElement>;
  onMouseLeave: MouseEventHandler<HTMLElement>;
}

function getTargetLink(path: string): string {
  if (!path.endsWith('?')) {
    return path;
  }

  const idx = path.lastIndexOf('/');

  return path.substring(0, idx);
}

function RootItem({
  children,
  path,
  hasSubItems,
  onMouseEnter,
  onMouseLeave,
  ...other
}: RootItemProps): JSX.Element {
  if (hasSubItems) {
    return (
      <ListItem {...other} button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </ListItem>
    );
  } else {
    return (
      <ListItem {...other} button component={renderLink(getTargetLink(path))}>
        {children}
      </ListItem>
    );
  }
}

function RailItem({
  path,
  icon: Icon,
  text,
  subItems,
  onClick,
  ...other
}: RailItemProps): JSX.Element {
  const classes = useStyles();
  const isCurrentPath = useRouteMatch(path);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();

  const hasSubItems = subItems && subItems.length > 0;

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!subItems?.length) {
      return;
    }

    setMenuAnchor(e.currentTarget);
  }

  function handleMouseLeave() {
    if (!!menuAnchor) {
      setMenuAnchor(undefined);
    }
  }

  function handleItemClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // FIXME: Does not work on first (!) click bc it opens (handleMouseEnter) and immediatly closes again (handleItemClick).
    setMenuAnchor(menuAnchor ? undefined : e.currentTarget);

    if (!!onClick && !e.isPropagationStopped()) {
      onClick(e);
    }
  }

  return (
    <RootItem
      {...other}
      path={path}
      hasSubItems={!!hasSubItems}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleItemClick}
    >
      <ListItemIcon className={clsx(isCurrentPath && classes.currentPath)}>
        <Icon />
      </ListItemIcon>

      <ListItemText className={classes.text} disableTypography>
        <Typography>{text}</Typography>

        {hasSubItems && <ChevronRight className={classes.menuIcon} />}
      </ListItemText>

      <Popper
        open={menuAnchor !== undefined}
        anchorEl={menuAnchor}
        placement={'right-start'}
        className={classes.popper}
      >
        <Paper className={classes.popperPaper}>
          {subItems?.map(({ text, subPath, icon: Icon, ...other }) => (
            <ListItem
              key={subPath + text}
              {...other}
              button
              component={renderLink(getTargetLink(subPath))}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>

              <ListItemText>{text}</ListItemText>
            </ListItem>
          ))}
        </Paper>
      </Popper>
    </RootItem>
  );
}

export default RailItem;
