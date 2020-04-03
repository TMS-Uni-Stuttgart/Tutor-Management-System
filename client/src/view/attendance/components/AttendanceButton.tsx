import { Button, ButtonProps } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { CreateCSSProperties } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React from 'react';
import { AttendanceState } from 'shared/model/Attendance';

export function getAttendanceColor(state: AttendanceState, theme: Theme): string {
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

const useStyles = makeStyles<Theme, StyleProps>((theme) =>
  createStyles({
    button: (props) => {
      const css: CreateCSSProperties = { marginLeft: theme.spacing(2) };

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
  })
);

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

export default AttendanceButton;
