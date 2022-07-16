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
import { renderLink } from './renderLink';
import { getTargetLink, useIsCurrentPath } from './RailItem.helpers';
import RailSubItem, { RailSubItemProps } from './RailSubItem';

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

export type ButtonListItemProps = ListItemProps<'div', { button?: true }>;

interface RailItemProps extends ButtonListItemProps {
  path: string;
  icon: React.ComponentType<SvgIconProps> | null;
  text: string;
  subItems?: RailSubItemProps[];
}

interface RootItemProps extends ButtonListItemProps {
  hasSubItems: boolean;
  path: string;
  onMouseEnter: MouseEventHandler<HTMLElement>;
  onMouseLeave: MouseEventHandler<HTMLElement>;
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
  const isCurrentPath = useIsCurrentPath(path, subItems);
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
    if (!hasSubItems) {
      return;
    }

    // FIXME: Does not work on first (!) touch bc it opens (handleMouseEnter) and immediatly closes again (handleItemClick).
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
      {!!Icon && (
        <ListItemIcon className={clsx(isCurrentPath && classes.currentPath)}>
          <Icon />
        </ListItemIcon>
      )}

      <ListItemText
        className={clsx(classes.text, isCurrentPath && classes.currentPath)}
        disableTypography
      >
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
          {subItems?.map((props) => (
            <RailSubItem key={props.subPath} {...props} />
          ))}
        </Paper>
      </Popper>
    </RootItem>
  );
}

export default RailItem;
