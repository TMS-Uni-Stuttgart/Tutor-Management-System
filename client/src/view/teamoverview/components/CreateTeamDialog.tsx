import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { Student } from 'shared/dist/model/Student';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      display: 'flex',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    list: {
      marginTop: theme.spacing(1),
      overflowY: 'auto',
    },
  })
);

interface SelectedStudents {
  [key: string]: boolean;
}

export interface TeamData {
  selectedStudents: SelectedStudents;
  teamNr: number;
}

interface Props extends DialogProps {
  onClose?: () => void;
  onSave: (teamData: TeamData) => void;
  students: Student[];
}

function CreateTeamDialog({ open, onSave, onClose, students, ...other }: Props): JSX.Element {
  const classes = useStyles();
  const [teamNr, setTeamNr] = useState('');
  const [selected, setSelected] = useState<SelectedStudents>({});

  function isButtonDisabled(): boolean {
    if (teamNr === '') {
      return true;
    }

    return Object.values(selected).reduce(
      (noneSelected, isSelected) => noneSelected && !isSelected,
      true
    );
  }

  function handleCreateTeam() {
    const teamData = {
      selectedStudents: selected,
      teamNr: Number.parseInt(teamNr, 10),
    };

    onSave(teamData);

    setTeamNr('');
    setSelected({});
    handleClose();
  }

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  function onStudentSelectionChanged(student: Student, isSelected: boolean) {
    setSelected({
      ...selected,
      [student.id]: isSelected,
    });
  }

  return (
    <Dialog open={open} fullWidth onClose={handleClose} {...other}>
      <DialogTitle>Team erstellen</DialogTitle>
      <DialogContent className={classes.content}>
        <form className={classes.form} noValidate autoComplete='off'>
          <TextField
            value={teamNr}
            label='Teamnummer'
            type='number'
            inputProps={{ min: 0 }}
            onChange={e => setTeamNr(e.target.value)}
          />

          <List className={classes.list}>
            {students.map(student => (
              <ListItem
                key={student.id}
                button
                onClick={() => onStudentSelectionChanged(student, !selected[student.id])}
              >
                <ListItemIcon>
                  <Checkbox
                    edge='start'
                    tabIndex={-1}
                    disableRipple
                    checked={selected[student.id] || false}
                    onChange={e => onStudentSelectionChanged(student, e.target.checked)}
                  />
                </ListItemIcon>
                <ListItemText primary={`${student.lastname}, ${student.firstname} `} />
              </ListItem>
            ))}
          </List>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button onClick={handleCreateTeam} color='primary' disabled={isButtonDisabled()}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateTeamDialog;
