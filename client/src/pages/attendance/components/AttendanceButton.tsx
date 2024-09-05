import { Button, ButtonProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
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
    button: (props: StyleProps) => {
      const mainColor = props.attendanceState
        ? getAttendanceColor(props.attendanceState, theme)
        : undefined;

      const style: any = {
        marginLeft: theme.spacing(2),
      };

      if (mainColor) {
        if (props.isContained) {
          style.backgroundColor = mainColor;
          style.color = theme.palette.getContrastText(mainColor);
          style['&:hover'] = {
            backgroundColor: theme.palette.augmentColor({
              color: {
                main: mainColor,
                light: theme.palette.grey[300],
                dark: theme.palette.grey[700],
              },
            }).light,
          };
        } else {
          style.color = mainColor;
          style.borderColor = mainColor;
          style['&:hover'] = {
            backgroundColor: theme.palette.action.hover,
            borderColor: mainColor,
          };
        }
      }

      return style;
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
