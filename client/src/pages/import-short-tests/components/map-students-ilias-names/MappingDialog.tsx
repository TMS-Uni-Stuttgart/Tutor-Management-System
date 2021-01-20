import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import FilterableSelect from '../../../../components/forms/components/FilterableSelect';
import { SelectionDialogChildrenProps } from '../../../../hooks/dialog-service/components/SelectionDialogContent';
import { Student } from '../../../../model/Student';
import { Tutorial } from '../../../../model/Tutorial';

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

      <Typography>
        Es werden nur die Studierenden in der Liste angezeigt, die zu keinem Iliasnamen zugeordnet
        werden konnten.
      </Typography>

      <FilterableSelect
        label='Studierende'
        emptyPlaceholder='Keine Studierenden vorhanden.'
        filterPlaceholder='Suche nach Namen'
        items={students}
        itemToString={(student) => ({
          primary: student.name,
          secondary: Tutorial.getDisplayString(student.tutorial),
        })}
        itemToValue={(student) => student.id}
        value={selected ? [selected.id] : []}
        onChange={(newValue) => {
          const value = newValue[0];

          setSelected(students.find((s) => s.id === value));
        }}
        singleSelect
        className={classes.select}
        listStartDimensions={{ height: 310, width: 1200 }}
      />
    </Box>
  );
}

export default MappingDialog;
