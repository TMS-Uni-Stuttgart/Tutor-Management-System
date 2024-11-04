import { Button, TableCell, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useField } from 'formik';
import PaperTableRow from '../../../../components/PaperTableRow';
import { StudentFormStateValue } from '../AdjustImportedStudentDataForm';
import { InformationOutline as InfoIcon } from 'mdi-material-ui';
import { Student } from 'model/Student';
import { useCallback } from 'react';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import StudentDetails from '../../../student-info/components/StudentDetails';

const emptyString = 'N/A';

const useStyles = makeStyles((theme) =>
  createStyles({
    infoButton: {
      marginLeft: 'auto',
      marginRight: theme.spacing(2),
    },
  })
);

interface StudentDataRowProps {
  name: string;
}

function StudentDataRow({ name }: StudentDataRowProps): JSX.Element {
  const classes = useStyles();
  const [, meta] = useField<StudentFormStateValue>(name);

  const { firstname, lastname, team, matriculationNo, iliasName, email, status, courseOfStudies } =
    meta.value;
  const subText = `Team: ${team || emptyString}`;

  const dialog = useDialog();
  const handleStudentInfo = useCallback(() => {
    dialog.show({
      title: `${lastname}, ${firstname}`,
      content: (
        <StudentDetails
          student={{
            email,
            status,
            iliasName,
            matriculationNo,
            courseOfStudies,
          }}
        />
      ),
      DialogProps: {
        maxWidth: 'lg',
      },
    });
  }, [dialog]);

  return (
    <>
      <PaperTableRow label={`${lastname}, ${firstname}`} subText={subText}>
        <TableCell>
          <Typography variant='body2'>Matrikelnummer: {matriculationNo || emptyString}</Typography>
          <Typography variant='body2'>Ilias-Name: {iliasName || emptyString}</Typography>
        </TableCell>
        <TableCell align='right'>
          <Button
            variant='outlined'
            startIcon={<InfoIcon />}
            className={classes.infoButton}
            onClick={() => handleStudentInfo()}
          >
            Informationen
          </Button>
        </TableCell>
      </PaperTableRow>
    </>
  );
}

export default StudentDataRow;
