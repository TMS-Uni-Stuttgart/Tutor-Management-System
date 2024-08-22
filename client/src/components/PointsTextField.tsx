import { Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { TextFieldProps } from '@mui/material/TextField';
import { convertExercisePointInfoToString, ExercisePointsInfo } from 'shared/model/Gradings';
import FormikTextField from './forms/components/FormikTextField';

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      width: 'unset',
      flex: 1,
      textAlign: 'right',
    },
  })
);

interface PointsTextFieldProps extends Omit<TextFieldProps, 'variant' | 'type'> {
  name: string;
  maxPoints: ExercisePointsInfo;
}

function PointsTextField({
  name,
  maxPoints,
  InputProps,
  ...other
}: PointsTextFieldProps): JSX.Element {
  const classes = useStyles();

  const maxPointsString = convertExercisePointInfoToString(maxPoints);

  return (
    <FormikTextField
      {...other}
      name={name}
      type='number'
      inputProps={{
        min: 0,
        step: 0.1,
        max: maxPoints.total,
        className: classes.input,
      }}
      InputProps={{
        ...InputProps,
        endAdornment: <Typography variant='body1' noWrap>{`/ ${maxPointsString}`}</Typography>,
      }}
    />
  );
}

export default PointsTextField;
