import { Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { ComponentType, HTMLProps } from 'react';
import { FixedSizeList } from 'react-window';
import { useResizeObserver } from '../../hooks/useResizeObserver';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: 'inherit',
      maxWidth: 'inherit',
    },
    placeholder: {
      marginTop: 64,
      textAlign: 'center',
    },
    itemRow: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(2),
      '&:hover': {
        background: theme.palette.action.hover,
      },
    },
  })
);

interface VirtualizedListComponentProps<T> {
  item: T;
  isScrolling?: boolean;
}

interface Props<T> extends HTMLProps<HTMLDivElement> {
  /**
   * Component that displays inside on row
   *
   * This is already wrapped by a properly styled `Paper` with `flex` display.
   */
  children: ComponentType<VirtualizedListComponentProps<T>>;

  /** Items to show in the list. */
  items: T[];

  /** A placeholder to show if no items are present. */
  placeholder: string;

  /**
   * Spacing between rows in px.
   *
   * Default: 16px.
   */
  rowSpacing?: number;
}

function VirtualizedList<T>({
  items,
  children: ItemRow,
  placeholder,
  rowSpacing = 16,
  ...props
}: Props<T>): JSX.Element {
  const classes = useStyles();
  const [root, { width, height }] = useResizeObserver<HTMLDivElement>();

  return (
    <div {...props} ref={root} className={clsx(props.className, classes.root)}>
      {items.length === 0 ? (
        <Typography variant='h6' className={classes.placeholder}>
          {placeholder}
        </Typography>
      ) : (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={80 + rowSpacing}
        >
          {({ index, style, isScrolling }) => {
            const item = items[index];
            const posTop = Number.parseInt(`${style.top ?? 0}`);
            const elHeight = Number.parseInt(`${style.height ?? 0}`);

            return (
              <Paper
                className={classes.itemRow}
                style={{
                  ...style,
                  top: posTop,
                  height: elHeight - rowSpacing,
                  width: 'calc(100% - 16px)',
                }}
              >
                <ItemRow item={item} isScrolling={isScrolling} />
              </Paper>
            );
          }}
        </FixedSizeList>
      )}
    </div>
  );
}

export default VirtualizedList;
