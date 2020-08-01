import { Collapse, IconButton, Paper, Tooltip, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Close as RemoveIcon } from 'mdi-material-ui';
import React from 'react';
import { NamedElement } from 'shared/model/Common';
import { getNameOfEntity } from 'shared/util/helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    selectedSubstitute: {
      display: 'grid',
      gridTemplate: '1fr 1fr / 1fr fit-content(56px)',
      padding: theme.spacing(2),
      marginTop: theme.spacing(2),
    },
    removeSubstituteButton: {
      alignSelf: 'center',
      gridArea: '1 / 2 / span 2',
    },
  })
);

interface Props {
  substitute?: NamedElement;
  onRemoveClicked: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function SelectedSubstituteBar({ substitute, onRemoveClicked }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Collapse in={!!substitute}>
      <Paper elevation={3} className={classes.selectedSubstitute}>
        <Typography variant='subtitle2'>Aktuelle Vertretung:</Typography>
        <Typography variant='subtitle1'>{!!substitute && getNameOfEntity(substitute)}</Typography>

        <Tooltip title='Vertretung entfernen'>
          <IconButton onClick={onRemoveClicked} className={classes.removeSubstituteButton}>
            <RemoveIcon />
          </IconButton>
        </Tooltip>
      </Paper>
    </Collapse>
  );
}

export default SelectedSubstituteBar;
