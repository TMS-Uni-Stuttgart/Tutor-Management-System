import { Box, Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useMemo } from 'react';
import TableWithPadding from '../../../../components/TableWithPadding';
import { UserFormState } from '../AdjustImportedUserDataForm';
import UserDataRow from './UserDataRow';
import { getNameOfEntity } from '../../../../../../server/src/shared/util/helpers';

function UserDataBox(): JSX.Element {
  const { values } = useFormikContext<UserFormState>();
  const users = useMemo(
    () =>
      Object.values(values).sort((a, b) => getNameOfEntity(a).localeCompare(getNameOfEntity(b))),
    [values]
  );

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
        items={users}
        createRowFromItem={(item) => <UserDataRow name={`${item.id}`} />}
      />
    </Box>
  );
}

export default UserDataBox;
