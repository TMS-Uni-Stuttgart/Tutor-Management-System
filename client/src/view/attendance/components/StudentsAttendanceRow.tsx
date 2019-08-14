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
import GREEN from '@material-ui/core/colors/green';
import ORANGE from '@material-ui/core/colors/orange';
import RED from '@material-ui/core/colors/red';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Person as PersonIcon } from '@material-ui/icons';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import { Formik, FormikHelpers } from 'formik';
import { NoteText as NoteTextIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import FormikTextField from '../../../components/forms/components/FormikTextField';
import SubmitButton from '../../../components/forms/components/SubmitButton';
import PaperTableRow from '../../../components/PaperTableRow';
import { useLogin } from '../../../hooks/LoginService';
import { FormikSubmitCallback } from '../../../types';
import { Attendance, AttendanceState, Role } from '../../../typings/ServerResponses';
import { StudentWithFetchedTeam } from '../../../typings/types';

const ATTENDANCE_COLORS: { [K in keyof typeof AttendanceState]: string } = {
  [AttendanceState.PRESENT]: GREEN[600],
  [AttendanceState.EXCUSED]: ORANGE[600],
  [AttendanceState.UNEXCUSED]: RED[600],
};

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
          css.background = ATTENDANCE_COLORS[props.attendanceState];
          css.color = theme.palette.getContrastText(ATTENDANCE_COLORS[props.attendanceState]);

          css['&:hover'] = {
            background: theme.palette.augmentColor({
              main: ATTENDANCE_COLORS[props.attendanceState],
            }).dark,
          };
        } else {
          css.color = ATTENDANCE_COLORS[props.attendanceState];
          css.borderColor = ATTENDANCE_COLORS[props.attendanceState];
        }
      }

      return css;
    },
    // underline: props => {
    //   if (props.attendanceState) {
    //     return {
    //       borderBottom: `4px solid ${ATTENDANCE_COLORS[props.attendanceState]}`,
    //       // position: 'absolute',
    //       // left: 0,
    //       // bottom: 0,
    //       // width: '100%',
    //       // height: 4,
    //       // background: ATTENDANCE_COLORS[props.attendanceState],
    //       // borderRadius: 0,
    //       borderBottomLeftRadius: 4,
    //       borderBottomRightRadius: 4,
    //     };
    //   }

    //   return {
    //     // display: 'none',
    //   };
    // },
    row: {
      // position: 'relative',
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

  const { userData } = useLogin();

  return (
    <PaperTableRow
      label={`${student.lastname}, ${student.firstname}`}
      subText={
        student.team ? `Team: #${student.team.teamNo.toString().padStart(2, '0')}` : 'Kein Team'
      }
      icon={PersonIcon}
      SubTextProps={!student.team ? { color: 'error' } : undefined}
      {...rest}
      className={clsx(classes.row)}
      colorOfBottomBar={attendanceState ? ATTENDANCE_COLORS[attendanceState] : undefined}
    >
      {/* {attendanceState && <td className={classes.underline} />} */}

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
