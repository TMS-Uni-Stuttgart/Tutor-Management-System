import { createStyles, makeStyles, TableCell } from '@material-ui/core';
import { useField, useFormikContext } from 'formik';
import PaperTableRow from '../../../../components/PaperTableRow';
import { useDialog } from '../../../../hooks/dialog-service/DialogService';
import { Tutorial } from '../../../../model/Tutorial';
import { StudentFormState, StudentFormStateValue } from '../AdjustImportedStudentDataForm';

const useStyles = makeStyles((theme) =>
  createStyles({
    chip: {
      margin: theme.spacing(0, 1, 1, 0),
    },
    editButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface StudentDataRowProps {
  name: string;
}

function StudentDataRow({ name }: StudentDataRowProps): JSX.Element {
  const classes = useStyles();

  const [, meta, helpers] = useField<StudentFormStateValue>(name);

  const { firstname, lastname } = meta.value;
  const subText = 'TODO';

  return (
    <>
      <PaperTableRow label={`${lastname}, ${firstname}`} subText={subText}>
        <TableCell></TableCell>
      </PaperTableRow>
    </>
  );
}

export default StudentDataRow;
