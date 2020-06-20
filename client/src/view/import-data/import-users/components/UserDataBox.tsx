import { Box, TableCell, Typography, IconButton } from '@material-ui/core';
import { useFormikContext } from 'formik';
import { SquareEditOutline as EditIcon, Undo as ResetIcon } from 'mdi-material-ui';
import React, { useEffect } from 'react';
import { Role } from 'shared/model/Role';
import PaperTableRow from '../../../../components/PaperTableRow';
import TableWithPadding from '../../../../components/TableWithPadding';
import { CSVDataRow, useImportDataContext } from '../../ImportData.context';
import { FormState, UserFormState, UserFormStateValue } from '../ImportUsers';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    editButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Props {
  name: string;
}

function UserDataBox({ name }: Props): JSX.Element {
  const classes = useStyles();
  const { values, setFieldValue } = useFormikContext<FormState>();
  const { data } = useImportDataContext();
  const emptyString = 'N/A';

  useEffect(() => {
    console.log('CALLED');
    const userFormState: UserFormState = {};
    data.rows.forEach(({ id, data }) => {
      userFormState[id] = {
        id,
        firstname: data[values.firstnameColumn] ?? emptyString,
        lastname: data[values.lastnameColumn] ?? emptyString,
        email: data[values.emailColumn] ?? emptyString,
        roles: [Role.TUTOR], // TODO: Parse roles column to actual roles! // TODO: Adjust to real values (ie real defaults if not provided)
        username: data[values.usernameColumn],
        password: data[values.passwordColumn],
      };
    });

    setFieldValue(name, userFormState);
  }, [
    data.rows,
    name,
    setFieldValue,
    values.firstnameColumn,
    values.lastnameColumn,
    values.emailColumn,
    values.rolesColumn,
    values.usernameColumn,
    values.passwordColumn,
  ]);

  const displayUsers = !!values.firstnameColumn && !!values.lastnameColumn && !!values.emailColumn;

  const createRowFromItem = (userData: UserFormStateValue) => {
    const { firstname, lastname, username, roles } = userData;
    const subText = [username, ...roles].filter(Boolean).join(', ');

    return (
      <PaperTableRow
        label={`${lastname}, ${firstname}`}
        subText={subText}
        buttonCellContent={
          <Box>
            <IconButton size='medium' className={classes.editButton}>
              <EditIcon />
            </IconButton>
            <IconButton size='medium'>
              <ResetIcon />
            </IconButton>
          </Box>
        }
      >
        <TableCell>
          <Typography>Keine Tutorien zugeordnet</Typography>
        </TableCell>
      </PaperTableRow>
    );
  };

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
        <TableWithPadding
          items={Object.values(values.users)}
          createRowFromItem={createRowFromItem}
        />
      )}
    </Box>
  );
}

export default UserDataBox;
