import {
  Box,
  Card,
  CardActions,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core';
import { SnackbarContentProps } from '@material-ui/core/SnackbarContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { ChevronDown as ExpandMoreIcon, Close as CloseIcon } from 'mdi-material-ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

type Variant = 'info' | 'warn' | 'error';

const useStyles = makeStyles<Theme, { variant?: Variant }>((theme: Theme) =>
  createStyles({
    card: {
      width: 420,
    },
    typography: {
      fontWeight: 'bold',
      marginRight: 'auto',
    },
    actionRoot: {
      display: 'flex',
      padding: theme.spacing(1, 1, 1, 2),
      color: theme.palette.getContrastText(theme.palette.orange.main),
      cursor: 'pointer',
    },
    actionRootBackground: ({ variant }) => {
      let backgroundColor: string;

      switch (variant) {
        case 'info':
          backgroundColor = theme.palette.info.main;
          break;

        case 'warn':
          backgroundColor = theme.palette.warning.main;
          break;

        case 'error':
          backgroundColor = theme.palette.error.main;
          break;

        default:
          backgroundColor = theme.palette.info.main;
      }

      return { backgroundColor };
    },
    expand: {
      color: theme.palette.getContrastText(theme.palette.orange.main),
      padding: theme.spacing(1, 1),
      transform: 'rotate(0deg)',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    collapse: {
      padding: theme.spacing(2),
    },
    list: {
      listStyle: 'disc',
      '& > li': {
        paddingLeft: 'unset',
        marginLeft: theme.spacing(2),
        display: 'list-item',
      },
    },
  })
);

export interface SnackbarWithListProps {
  id: string | number | undefined;
  title: string;
  textBeforeList: string;
  items: string[];
  isOpen?: boolean;

  /**
   * Variant of the snackbar.
   *
   * Defaults to 'info'.
   */
  variant?: Variant;
}

function Component(
  { title, textBeforeList, items, id, isOpen, variant }: SnackbarWithListProps,
  ref: React.Ref<SnackbarContentProps>
): JSX.Element {
  const [isExpanded, setExpanded] = useState(!!isOpen);
  const { closeSnackbar } = useSnackbar();
  const classes = useStyles({ variant });

  function handleExpandClick() {
    setExpanded(!isExpanded);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    closeSnackbar(id);
  }

  return (
    <Card ref={ref} className={classes.card}>
      <CardActions
        classes={{ root: clsx(classes.actionRoot, classes.actionRootBackground) }}
        onClick={handleExpandClick}
      >
        <Typography variant='subtitle2' className={classes.typography}>
          {title}
        </Typography>

        <Box display='flex'>
          <IconButton
            aria-label='Show more'
            className={clsx(classes.expand, { [classes.expandOpen]: isExpanded })}
            onClick={handleExpandClick}
          >
            <ExpandMoreIcon />
          </IconButton>

          <IconButton className={classes.expand} onClick={handleDismiss}>
            <CloseIcon />
          </IconButton>
        </Box>
      </CardActions>

      <Collapse in={isExpanded} timeout='auto' unmountOnExit>
        <Paper className={classes.collapse}>
          <Typography>{textBeforeList}</Typography>
          <List dense className={classes.list}>
            {items.map((item, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>
    </Card>
  );
}

const SnackbarWithList = React.forwardRef<SnackbarContentProps, SnackbarWithListProps>(Component);

export default SnackbarWithList;
