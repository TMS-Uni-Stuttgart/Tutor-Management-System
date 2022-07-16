import { Divider, List, ListItem, ListItemText, ListProps } from '@material-ui/core';
import React from 'react';

interface Props extends ListProps {
  items: { primary: string; secondary?: string }[];
}

function OrderedList({ items, ...props }: Props): JSX.Element {
  return (
    <List {...props}>
      {items.map((item, idx) => (
        <React.Fragment key={item.primary}>
          <ListItem>
            <ListItemText primary={`${idx + 1}. ${item.primary}`} secondary={item.secondary} />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

export default OrderedList;
