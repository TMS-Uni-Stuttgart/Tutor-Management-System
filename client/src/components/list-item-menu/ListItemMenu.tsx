import React, { useState, ComponentType, MouseEventHandler } from 'react';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { ListItemIcon, ListItemText, MenuItem, Tooltip } from '@material-ui/core';
import { ListItemTextProps } from '@material-ui/core/ListItemText';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import { MenuItemProps } from '@material-ui/core/MenuItem';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { IconButton } from '@material-ui/core';

type UsedProps =
  | 'open'
  | 'anchorEl'
  | 'onClose'
  | 'anchorOrigin'
  | 'transformOrigin'
  | 'getContentAnchorEl';

export interface ListItem extends MenuItemProps {
  primary: string;
  onClick: MouseEventHandler<HTMLLIElement>;
  Icon: ComponentType<SvgIconProps>;
  listItemTextProps?: ListItemTextProps;
  iconProps?: SvgIconProps;
  tooltip?: string;
}

export interface ListItemMenuProps extends Omit<MenuProps, UsedProps> {
  items: ListItem[];
  stopClickPropagation?: boolean;
}

function generateListItem({
  Icon,
  primary,
  onClick,
  iconProps,
  listItemTextProps,
  disabled,
  tooltip,
}: ListItem): JSX.Element {
  const menuItem = (
    <MenuItem key={primary} onClick={onClick} disabled={disabled}>
      <ListItemIcon>
        <Icon {...iconProps} />
      </ListItemIcon>

      <ListItemText {...listItemTextProps} primary={primary} />
    </MenuItem>
  );

  return tooltip ? (
    <Tooltip title={tooltip} key={primary}>
      {menuItem}
    </Tooltip>
  ) : (
    menuItem
  );
}

function ListItemMenu({ items, stopClickPropagation, ...other }: ListItemMenuProps): JSX.Element {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>(undefined);

  return (
    <>
      <IconButton
        onClick={e => {
          if (stopClickPropagation) {
            e.stopPropagation();
          }

          setMenuAnchor(e.currentTarget as HTMLElement);
        }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        {...other}
        open={menuAnchor !== undefined}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(undefined)}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        getContentAnchorEl={undefined}
        onClick={e => {
          if (stopClickPropagation) {
            e.stopPropagation();
          }

          setMenuAnchor(undefined);
        }}
      >
        {items.map(item => generateListItem(item))}
      </Menu>
    </>
  );
}

export default ListItemMenu;
