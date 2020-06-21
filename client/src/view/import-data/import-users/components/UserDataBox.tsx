import { Box, Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useEffect, useRef } from 'react';
import TableWithPadding from '../../../../components/TableWithPadding';
import { useImportDataContext } from '../../ImportData.context';
import { FormState } from '../ImportUsers';
import { convertCSVDataToFormData } from './UserDataBox.helpers';
import UserDataRow from './UserDataRow';

interface Props {
  name: string;
}

function didColumnChange(prev: FormState, current: FormState): boolean {
  const keys = Object.keys(prev).filter((key) => key !== 'users') as (keyof FormState)[];

  for (const key of keys) {
    if (prev[key] !== current[key]) {
      return true;
    }
  }

  return false;
}

function UserDataBox({ name }: Props): JSX.Element {
  const { values, setFieldValue } = useFormikContext<FormState>();
  const { data } = useImportDataContext();
  const prev = useRef<FormState>(values);

  const displayUsers = !!values.firstnameColumn && !!values.lastnameColumn && !!values.emailColumn;

  useEffect(() => {
    if (didColumnChange(values, prev.current)) {
      prev.current = values;
      setFieldValue(name, convertCSVDataToFormData(data, values));
    }
  }, [data.rows, name, setFieldValue, values, data]);

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

      {displayUsers && (
        <TableWithPadding items={Object.values(values.users)} createRowFromItem={UserDataRow} />
      )}
    </Box>
  );
}

export default UserDataBox;
