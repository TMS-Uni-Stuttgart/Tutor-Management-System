import { Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import { useMemo } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import OutlinedBox from '../../../../components/OutlinedBox';
import TableWithPadding from '../../../../components/TableWithPadding';
import { Tutorial } from '../../../../model/Tutorial';
import { StudentFormState } from '../AdjustImportedStudentDataForm';
import StudentDataRow from './StudentDataRow';

function StudentDataBox(): JSX.Element {
  const { values } = useFormikContext<StudentFormState>();
  const users = useMemo(
    () =>
      Object.values(values).sort((a, b) => getNameOfEntity(a).localeCompare(getNameOfEntity(b))),
    [values]
  );

  return (
    <OutlinedBox flex={1}>
      <Typography>Studierendendaten festlegen</Typography>

      <TableWithPadding
        items={users}
        createRowFromItem={(item) => <StudentDataRow name={`${item.rowNr}`} />}
        BoxProps={{ marginTop: 2 }}
      />
    </OutlinedBox>
  );
}

export default StudentDataBox;
