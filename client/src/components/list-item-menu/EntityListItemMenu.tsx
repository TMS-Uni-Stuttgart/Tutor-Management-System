import { Delete as DeleteIcon, Information as InfoIcon, Pencil as EditIcon } from 'mdi-material-ui';
import React, { MouseEventHandler } from 'react';
import ListItemMenu, { ListItem, ListItemMenuProps } from './ListItemMenu';

export interface EntityListItemMenuProps extends Omit<ListItemMenuProps, 'items'> {
  onEditClicked?: MouseEventHandler<HTMLLIElement>;
  onMoreInfosClicked?: MouseEventHandler<HTMLLIElement>;
  onDeleteClicked?: MouseEventHandler<HTMLLIElement>;
  additionalItems?: ListItem[];
  disableDelete?: boolean;
  editTooltip?: string;
  moreInfosTooltip?: string;
  deleteTooltip?: string;
}

function EntityListItemMenu({
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
}: EntityListItemMenuProps): JSX.Element {
  const items: ListItem[] = [];

  if (!!onEditClicked) {
    items.push({
      primary: 'Bearbeiten',
      onClick: onEditClicked,
      Icon: EditIcon,
      tooltip: editTooltip,
    });
  }

  if (!!onMoreInfosClicked) {
    items.push({
      primary: 'Mehr Infos',
      onClick: onMoreInfosClicked,
      Icon: InfoIcon,
      tooltip: moreInfosTooltip,
    });
  }

  if (!!additionalItems) {
    items.push(...additionalItems);
  }

  if (!!onDeleteClicked) {
    items.push({
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
    });
  }

  return <ListItemMenu items={items} stopClickPropagation={stopClickPropagation} {...other} />;
}

export default EntityListItemMenu;
