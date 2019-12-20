import React, { useState, ComponentType, MouseEventHandler } from 'react';
import {
  Delete as DeleteIcon,
  Pencil as EditIcon,
  Information as InfoIcon,
  DotsVertical as MoreVertIcon,
} from 'mdi-material-ui';
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

interface ListItem extends MenuItemProps {
  primary: string;
  onClick: MouseEventHandler<HTMLLIElement>;
  Icon: ComponentType<SvgIconProps>;
  listItemTextProps?: ListItemTextProps;
  iconProps?: SvgIconProps;
  tooltip?: string;
}

export interface ListItemMenuProps extends Omit<MenuProps, UsedProps> {
  onEditClicked?: MouseEventHandler<HTMLLIElement>;
  onMoreInfosClicked?: MouseEventHandler<HTMLLIElement>;
  onDeleteClicked?: MouseEventHandler<HTMLLIElement>;
  additionalItems?: ListItem[];
  stopClickPropagation?: boolean;
  disableDelete?: boolean;
  editTooltip?: string;
  moreInfosTooltip?: string;
  deleteTooltip?: string;
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

function ListItemMenu({
  onEditClicked,
  onMoreInfosClicked,
  onDeleteClicked,
  additionalItems,
  stopClickPropagation,
  disableDelete,
  deleteTooltip,
  moreInfosTooltip,
  editTooltip,
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
            tooltip: editTooltip,
          })}

        {onMoreInfosClicked &&
          generateListItem({
            primary: 'Mehr Infos',
            onClick: onMoreInfosClicked,
            Icon: InfoIcon,
            tooltip: moreInfosTooltip,
          })}

        {additionalItems && additionalItems.map(item => generateListItem(item))}

        {onDeleteClicked &&
          generateListItem({
            primary: 'Entfernen',
            onClick: onDeleteClicked,
            disabled: disableDelete,
            tooltip: deleteTooltip,
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
