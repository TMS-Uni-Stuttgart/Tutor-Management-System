import { Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useMemo } from 'react';
import { getNameOfEntity } from '../../../../../../server/src/shared/util/helpers';
import OutlinedBox from '../../../../components/OutlinedBox';
import TableWithPadding from '../../../../components/TableWithPadding';
import { UserFormState } from '../AdjustImportedUserDataForm';
import UserDataRow from './UserDataRow';

function UserDataBox(): JSX.Element {
  const { values } = useFormikContext<UserFormState>();
  const users = useMemo(
    () =>
      Object.values(values).sort((a, b) => getNameOfEntity(a).localeCompare(getNameOfEntity(b))),
    [values]
  );

  return (
    <OutlinedBox flex={1} marginLeft={2}>
      <Typography>Nutzerdaten festlegen</Typography>

      <TableWithPadding
        items={users}
        createRowFromItem={(item) => <UserDataRow name={`${item.rowNr}`} />}
        BoxProps={{ marginTop: 2 }}
      />
    </OutlinedBox>
  );
}

export default UserDataBox;
