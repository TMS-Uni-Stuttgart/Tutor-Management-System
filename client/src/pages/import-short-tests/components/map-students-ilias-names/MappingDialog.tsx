import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { getNameOfEntity } from 'shared/util/helpers';
import FilterableSelect from '../../../../components/forms/components/FilterableSelect';
import { SelectionDialogChildrenProps } from '../../../../hooks/dialog-service/components/SelectionDialogContent';
import { Student } from '../../../../model/Student';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      marginTop: theme.spacing(3),
    },
  })
);

interface Props extends SelectionDialogChildrenProps<Student> {
  iliasName: string;
  students: Student[];
  initiallySelected?: Student;
}

function MappingDialog({
  students,
  iliasName,
  selected,
  setSelected,
  initiallySelected,
}: Props): JSX.Element {
  const classes = useStyles();

  useEffect(() => {
    if (initiallySelected) {
      setSelected(initiallySelected);
    }
  }, [initiallySelected, setSelected]);

  return (
    <Box display='flex' flexDirection='column'>
      <Typography>
        Wähle den/die Studierende/n aus, der zum Iliasnamen &ldquo;{iliasName}&rdquo; gehört.
        Beachte, dass diese Zuordnung nur für diesen Kurztest-Import gültig ist.
      </Typography>

      <FilterableSelect
        label='Studierende'
        emptyPlaceholder='Keine Studierenden vorhanden.'
        filterPlaceholder='Suche nach Namen'
        items={students}
        itemToString={(student) => getNameOfEntity(student)}
        itemToValue={(student) => student.id}
        value={selected ? [selected.id] : []}
        onChange={(newValue) => {
          const value = newValue[0];

          setSelected(students.find((s) => s.id === value));
        }}
        singleSelect
        className={classes.select}
      />
    </Box>
  );
}

export default MappingDialog;
