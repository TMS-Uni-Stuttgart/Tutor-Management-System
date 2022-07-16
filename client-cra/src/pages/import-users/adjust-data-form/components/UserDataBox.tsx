import { Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useMemo } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import OutlinedBox from '../../../../components/OutlinedBox';
import TableWithPadding from '../../../../components/TableWithPadding';
import { Tutorial } from '../../../../model/Tutorial';
import { UserFormState } from '../AdjustImportedUserDataForm';
import UserDataRow from './UserDataRow';

interface Props {
  tutorials: Tutorial[];
}

function UserDataBox({ tutorials }: Props): JSX.Element {
  const { values } = useFormikContext<UserFormState>();
  const users = useMemo(
    () =>
      Object.values(values).sort((a, b) => getNameOfEntity(a).localeCompare(getNameOfEntity(b))),
    [values]
  );

  return (
    <OutlinedBox flex={1}>
      <Typography>Nutzerdaten festlegen</Typography>

      <TableWithPadding
        items={users}
        createRowFromItem={(item) => <UserDataRow name={`${item.rowNr}`} tutorials={tutorials} />}
        BoxProps={{ marginTop: 2 }}
      />
    </OutlinedBox>
  );
}

export default UserDataBox;
