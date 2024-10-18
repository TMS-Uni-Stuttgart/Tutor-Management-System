import { IconButton, ListItemIcon, ListItemText, MenuItem, Tooltip } from '@mui/material';
import { ListItemTextProps } from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import { MenuItemProps } from '@mui/material/MenuItem';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { DotsVertical as MoreVertIcon } from 'mdi-material-ui';
import { ComponentType, MouseEventHandler, useState } from 'react';

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
    <MenuItem key={primary} onClick={onClick} disabled={disabled}>
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
        size='large'
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
