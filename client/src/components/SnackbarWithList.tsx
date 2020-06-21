import {
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

const useStyles = makeStyles((theme: Theme) =>
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
      backgroundColor: theme.palette.orange.main,
      color: theme.palette.getContrastText(theme.palette.orange.main),
      cursor: 'pointer',
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

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    closeSnackbar(id);
  }

  return (
    <Card ref={ref} className={classes.card}>
      <CardActions classes={{ root: classes.actionRoot }} onClick={handleExpandClick}>
        <Typography variant='subtitle2' className={classes.typography}>
          {title}
        </Typography>

        <div>
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

const SnackbarWithList = React.forwardRef<SnackbarContentProps, Props>(Component);

export default SnackbarWithList;
