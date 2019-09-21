import {
  Card,
  CardActions,
  Collapse,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { amber } from '@material-ui/core/colors';
import { SnackbarContentProps } from '@material-ui/core/SnackbarContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 420,
    },
    typography: {
      fontWeight: 'bold',
    },
    actionRoot: {
      padding: theme.spacing(1, 1, 1, 2),
      backgroundColor: amber[700],
    },
    icons: {
      marginLeft: 'auto',
    },
    expand: {
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
  })
);

interface Props {
  id: string | number | undefined;
  title: string;
  textBeforeList: string;
  items: string[];
  isOpen?: boolean;
}

function Component(
  { title, textBeforeList, items, id, isOpen }: Props,
  ref: React.Ref<SnackbarContentProps>
): JSX.Element {
  const [isExpanded, setExpanded] = useState(!!isOpen);
  const { closeSnackbar } = useSnackbar();
  const classes = useStyles();

  function handleExpandClick() {
    setExpanded(!isExpanded);
  }

  function handleDismiss() {
    closeSnackbar(id);
  }

  return (
    <Card ref={ref} className={classes.card}>
      <CardActions classes={{ root: classes.actionRoot }}>
        <Typography variant='subtitle2' className={classes.typography}>
          {title}
        </Typography>

        <div className={classes.icons}>
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
        </div>
      </CardActions>

      <Collapse in={isExpanded} timeout='auto' unmountOnExit>
        <Paper className={classes.collapse}>
          <Typography>{textBeforeList}</Typography>
          <List dense>
            {items.map(item => (
              <ListItem key={item}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>
    </Card>
  );
}

const SnackbarWithList = React.forwardRef<SnackbarContentProps, Props>(Component);

export default SnackbarWithList;
