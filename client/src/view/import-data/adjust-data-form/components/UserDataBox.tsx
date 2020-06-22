import { Box, Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import TableWithPadding from '../../../../components/TableWithPadding';
import { useImportDataContext } from '../../ImportUsers.context';
import { UserFormState } from '../AdjustImportedUserDataForm';
import { convertCSVDataToFormData } from './UserDataBox.helpers';
import UserDataRow from './UserDataRow';

function UserDataBox(): JSX.Element {
  const { values, setValues } = useFormikContext<UserFormState>();
  const { data, mappedColumns } = useImportDataContext();

  useEffect(() => {
    setValues(convertCSVDataToFormData(data, mappedColumns));
  }, [data.rows, setValues, mappedColumns, data]);

  return (
    <Box
      flex={1}
      marginLeft={2}
      border={2}
      borderColor='divider'
      borderRadius='borderRadius'
      padding={1}
    >
      <Typography>Nutzerdaten festlegen</Typography>

      <TableWithPadding
        items={Object.values(values)}
        createRowFromItem={(item, idx) => <UserDataRow name={`${idx}`} />}
      />
    </Box>
  );
}

export default UserDataBox;
