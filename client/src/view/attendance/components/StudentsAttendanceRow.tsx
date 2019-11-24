import {
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  TableCell,
  Typography,
} from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import { Formik, FormikHelpers } from 'formik';
import { NoteText as NoteTextIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { Attendance, AttendanceState } from 'shared/dist/model/Attendance';
import { Role } from 'shared/dist/model/Role';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import SubmitButton from '../../../components/forms/components/SubmitButton';
import PaperTableRow from '../../../components/PaperTableRow';
import StudentAvatar from '../../../components/student-icon/StudentAvatar';
import { useLogin } from '../../../hooks/LoginService';
import { FormikSubmitCallback } from '../../../types';
import { StudentWithFetchedTeam } from '../../../typings/types';
import CakeCount from './CakeCount';

function getAttendanceColor(state: AttendanceState, theme: Theme): string {
  const ATTENDANCE_COLORS: { [K in keyof typeof AttendanceState]: string } = {
    [AttendanceState.PRESENT]: theme.palette.green.main,
    [AttendanceState.EXCUSED]: theme.palette.orange.main,
    [AttendanceState.UNEXCUSED]: theme.palette.red.main,
  };

  return ATTENDANCE_COLORS[state];
}

interface StyleProps {
  attendanceState: AttendanceState | undefined;
  isContained: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
  createStyles({
    button: props => {
      const css: CSSProperties = { marginLeft: theme.spacing(2) };

      if (props.attendanceState) {
        if (props.isContained) {
          css.background = getAttendanceColor(props.attendanceState, theme);
          css.color = theme.palette.getContrastText(css.background);

          css['&:hover'] = {
            background: theme.palette.augmentColor({
              main: getAttendanceColor(props.attendanceState, theme),
            }).dark,
          };
        } else {
          css.color = getAttendanceColor(props.attendanceState, theme);
          css.borderColor = css.color;
        }
      }

      return css;
    },
    row: {
      height: 76,
    },
    noteTableCell: {
      maxWidth: 250,
    },
    popperPaper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      padding: theme.spacing(2),
      minWidth: 256 * 1.5,
    },
    popperForm: {
      width: '100%',
      height: '100%',
    },
    popperButtonBox: {
      display: 'flex',
      marginTop: theme.spacing(2),
      justifyContent: 'flex-end',
    },
    popperButton: {
      marginLeft: theme.spacing(1),
    },
    cakeIcon: {
      marginLeft: theme.spacing(0.5),
    },
  })
);

interface NoteFormState {
  note: string;
}

export type NoteFormCallback = (
  values: NoteFormState,
  actions: FormikHelpers<NoteFormState>,
  closeDialog: () => void
) => void;

interface Props {
  student: StudentWithFetchedTeam;
  attendance: Attendance | undefined;
  onAttendanceSelection: (state?: AttendanceState) => void;
  onNoteSave: NoteFormCallback;
  onCakeCountChanged?: (cakeCount: number) => void;
}

interface AttendanceButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  attendanceState: AttendanceState;
  isSelected: boolean;
}

function AttendanceButton({
  children,
  className,
  attendanceState,
  isSelected,
  ...other
}: AttendanceButtonProps): JSX.Element {
  const classes = useStyles({ attendanceState, isContained: isSelected });

  return (
    <Button
      {...other}
      className={clsx(classes.button, className)}
      variant={isSelected ? 'contained' : 'outlined'}
    >
      {children}
    </Button>
  );
}

function StudentAttendanceRow({
  student,
  attendance,
  onAttendanceSelection,
  onNoteSave,
  onCakeCountChanged,
  ...rest
}: Props): JSX.Element {
  const attendanceState: AttendanceState | undefined = attendance ? attendance.state : undefined;
  const [noteAnchor, setNoteAnchor] = useState<HTMLElement | undefined>(undefined);
  const initialNoteFormState: NoteFormState = {
    note: attendance ? attendance.note || '' : '',
  };
  const classes = useStyles({
    attendanceState: attendanceState,
    isContained: false,
  });

  const theme = useTheme();
  const { userData } = useLogin();

  function handleAttendanceClick(newState: AttendanceState) {
    if (attendanceState !== newState) {
      onAttendanceSelection(newState);
    } else {
      onAttendanceSelection(undefined);
    }
  }

  function handleCloseNotePopper() {
    setNoteAnchor(undefined);
  }

  const handleSaveNote: FormikSubmitCallback<NoteFormState> = (values, actions) => {
    onNoteSave(values, actions, handleCloseNotePopper);
  };

  return (
    <PaperTableRow
      label={`${student.lastname}, ${student.firstname}`}
      subText={
        student.team ? `Team: #${student.team.teamNo.toString().padStart(2, '0')}` : 'Kein Team'
      }
      Avatar={<StudentAvatar student={student} />}
      SubTextProps={!student.team ? { color: 'error' } : undefined}
      {...rest}
      className={clsx(classes.row)}
      colorOfBottomBar={attendanceState ? getAttendanceColor(attendanceState, theme) : undefined}
    >
      {onCakeCountChanged && (
        <TableCell>
          <CakeCount cakeCount={student.cakeCount} onCakeCountChanged={onCakeCountChanged} />
        </TableCell>
      )}

      <TableCell className={classes.noteTableCell}>
        {/* TODO: Add Tooltip (to show longer texts!) */}
        <Typography noWrap>{attendance ? attendance.note : null}</Typography>
      </TableCell>

      <TableCell align='right'>
        <IconButton onClick={e => setNoteAnchor(e.target as HTMLElement)}>
          <NoteTextIcon />
        </IconButton>

        <AttendanceButton
          attendanceState={AttendanceState.PRESENT}
          isSelected={attendanceState === AttendanceState.PRESENT}
          onClick={() => handleAttendanceClick(AttendanceState.PRESENT)}
          disabled={
            userData &&
            !userData.roles.includes(Role.ADMIN) &&
            attendanceState === AttendanceState.EXCUSED
          }
        >
          Anwesend
        </AttendanceButton>
        <AttendanceButton
          attendanceState={AttendanceState.EXCUSED}
          isSelected={attendanceState === AttendanceState.EXCUSED}
          onClick={() => handleAttendanceClick(AttendanceState.EXCUSED)}
          disabled={userData && userData.roles.includes(Role.ADMIN) ? false : true}
        >
          Entschuldigt
        </AttendanceButton>
        <AttendanceButton
          attendanceState={AttendanceState.UNEXCUSED}
          isSelected={attendanceState === AttendanceState.UNEXCUSED}
          onClick={() => handleAttendanceClick(AttendanceState.UNEXCUSED)}
          disabled={
            userData &&
            !userData.roles.includes(Role.ADMIN) &&
            attendanceState === AttendanceState.EXCUSED
          }
        >
          Unentschuldigt
        </AttendanceButton>
      </TableCell>

      <Popper open={!!noteAnchor} anchorEl={noteAnchor} placement='bottom-end'>
        <ClickAwayListener onClickAway={handleCloseNotePopper}>
          <Paper elevation={10} className={classes.popperPaper}>
            <Formik initialValues={initialNoteFormState} onSubmit={handleSaveNote}>
              {({ handleSubmit, isSubmitting, isValid }) => (
                <form onSubmit={handleSubmit} className={classes.popperForm}>
                  <FormikTextField name='note' label='Anmerkung' fullWidth autoFocus />

                  <div className={classes.popperButtonBox}>
                    <Button className={classes.popperButton} onClick={handleCloseNotePopper}>
                      Abbrechen
                    </Button>
                    <SubmitButton
                      color='primary'
                      className={classes.popperButton}
                      isSubmitting={isSubmitting}
                      disabled={!isValid}
                    >
                      Speichern
                    </SubmitButton>
                  </div>
                </form>
              )}
            </Formik>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </PaperTableRow>
  );
}

export default StudentAttendanceRow;
