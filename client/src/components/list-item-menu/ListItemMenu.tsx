import { IconButton, ListItemIcon, ListItemText, MenuItem, Tooltip } from '@material-ui/core';
import { ListItemTextProps } from '@material-ui/core/ListItemText';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import { MenuItemProps } from '@material-ui/core/MenuItem';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { DotsVertical as MoreVertIcon } from 'mdi-material-ui';
import React, { ComponentType, MouseEventHandler, useState } from 'react';

type UsedProps =
  | 'open'
  | 'anchorEl'
  | 'onClose'
  | 'anchorOrigin'
  | 'transformOrigin'
  | 'getContentAnchorEl';

export interface ListItem extends MenuItemProps<'button'> {
  primary: string;
  secondary?: string;
  onClick: MouseEventHandler<HTMLElement>;
  Icon: ComponentType<SvgIconProps>;
  listItemTextProps?: Omit<ListItemTextProps, 'primary' | 'secondary'>;
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
  secondary,
  onClick,
  iconProps,
  listItemTextProps,
  disabled,
  tooltip,
}: ListItem): JSX.Element {
  // The href is added through a spreaded object due to the MenuItem typing not being aware of the href property existing on the ButtonBase.
  const menuItem = (
    <MenuItem button key={primary} onClick={onClick} disabled={disabled}>
      <ListItemIcon>
        <Icon {...iconProps} />
      </ListItemIcon>

      <ListItemText {...listItemTextProps} primary={primary} secondary={secondary} />
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
        onClick={(e) => {
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
        onClick={(e) => {
          if (stopClickPropagation) {
            e.stopPropagation();
          }

          setMenuAnchor(undefined);
        }}
      >
        {items.map((item) => generateListItem(item))}
      </Menu>
    </>
  );
}

export default ListItemMenu;
