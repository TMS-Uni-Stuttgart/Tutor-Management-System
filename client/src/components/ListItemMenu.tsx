import React, { useState, ComponentType, MouseEventHandler } from 'react';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
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

interface ListItem extends MenuItemProps {
  primary: string;
  onClick: MouseEventHandler<HTMLLIElement>;
  Icon: ComponentType<SvgIconProps>;
  listItemTextProps?: ListItemTextProps;
  iconProps?: SvgIconProps;
}

export interface ListItemMenuProps extends Omit<MenuProps, UsedProps> {
  onEditClicked?: MouseEventHandler<HTMLLIElement>;
  onMoreInfosClicked?: MouseEventHandler<HTMLLIElement>;
  onDeleteClicked?: MouseEventHandler<HTMLLIElement>;
  additionalItems?: ListItem[];
  stopClickPropagation?: boolean;
}

function generateListItem({
  Icon,
  primary,
  onClick,
  iconProps,
  listItemTextProps,
}: ListItem): JSX.Element {
  return (
    <MenuItem key={primary} onClick={onClick}>
      <ListItemIcon>
        <Icon {...iconProps} />
      </ListItemIcon>

      <ListItemText {...listItemTextProps} primary={primary} />
    </MenuItem>
  );
}

function ListItemMenu({
  onEditClicked,
  onMoreInfosClicked,
  onDeleteClicked,
  additionalItems,
  stopClickPropagation,
  ...other
}: ListItemMenuProps): JSX.Element {
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
        {onEditClicked &&
          generateListItem({
            primary: 'Bearbeiten',
            onClick: onEditClicked,
            Icon: EditIcon,
          })}

        {onMoreInfosClicked &&
          generateListItem({
            primary: 'Mehr Infos',
            onClick: onMoreInfosClicked,
            Icon: InfoIcon,
          })}

        {additionalItems && additionalItems.map(item => generateListItem(item))}

        {onDeleteClicked &&
          generateListItem({
            primary: 'Entfernen',
            onClick: onDeleteClicked,
            listItemTextProps: {
              primaryTypographyProps: { color: 'error' },
            },
            Icon: DeleteIcon,
            iconProps: {
              color: 'error',
            },
          })}
      </Menu>
    </>
  );
}

export default ListItemMenu;
