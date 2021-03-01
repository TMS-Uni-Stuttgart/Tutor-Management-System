import { Box, BoxProps, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import CustomSelect, { OnChangeHandler } from '../../../components/CustomSelect';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import Markdown from '../../../components/markdown/Markdown';
import Placeholder from '../../../components/Placeholder';
import PointsTable from '../../../components/points-table/PointsTable';
import { getStudentCorrectionCommentMarkdown } from '../../../hooks/fetching/Markdown';
import { HasExercises } from '../../../model/Exercise';
import { Grading } from '../../../model/Grading';
import { Student } from '../../../model/Student';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    pointsTable: {
      width: 'unset',
    },
    markdownBox: {
      flex: 1,
      marginLeft: theme.spacing(2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1.5),
    },
  })
);

interface Props extends BoxProps {
  /** Student to show grading for. */
  student: Student;

  /** Entities for which the student can have gradings. */
  entities: HasExercises[];

  /** Label of the select component of the entities. */
  selectLabel: string;

  /** Text shown in select component if entities is empty. */
  selectEmptyPlaceholder: string;

  /** Name of the 'none' item in the select. */
  selectNameOfNoneItem: string;

  /** Text shown to the user instead of the grading of no entity is selected. */
  noneSelectedPlaceholder: string;

  /** Disables the display of the comment. */
  disableCommentDisplay?: boolean;
}

function GradingInformation({
  student,
  entities,
  selectLabel,
  selectEmptyPlaceholder,
  selectNameOfNoneItem,
  noneSelectedPlaceholder,
  disableCommentDisplay,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [gradingOfSelected, setGradingOfSelected] = useState<Grading>();
  const [selectedEntity, setSelectedEntity] = useState<HasExercises>();
  const [studentMarkdown, setStudentMarkdown] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setStudentMarkdown(undefined);

    if (!selectedEntity) {
      setGradingOfSelected(undefined);
      return;
    }

    setGradingOfSelected(student.getGrading(selectedEntity));

    if (!disableCommentDisplay) {
      setLoading(true);
      getStudentCorrectionCommentMarkdown(selectedEntity.id, student.id)
        .then((response) => {
          setStudentMarkdown(response);
        })
        .catch(() => {
          setStudentMarkdown('');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedEntity, student, enqueueSnackbar, disableCommentDisplay]);

  const handleSheetSelectionChange: OnChangeHandler = (e) => {
    if (typeof e.target.value !== 'string') {
      return;
    }

    const entityId = e.target.value as string;
    const entity = entities.find((s) => s.id === entityId);

    setSelectedEntity(entity);
  };

  return (
    <Box {...props}>
      <Box display='flex' alignItems='center'>
        <Typography variant='h6'>Bewertung für </Typography>

        <CustomSelect
          label={selectLabel}
          emptyPlaceholder={selectEmptyPlaceholder}
          nameOfNoneItem={selectNameOfNoneItem}
          className={classes.select}
          items={entities}
          itemToString={(entity) => entity.toDisplayString()}
          itemToValue={(entity) => entity.id}
          onChange={handleSheetSelectionChange}
          value={selectedEntity?.id ?? ''}
        />
      </Box>

      <Placeholder
        placeholderText={!selectedEntity ? noneSelectedPlaceholder : 'Keine Bewertung verfügbar.'}
        showPlaceholder={!selectedEntity || !gradingOfSelected}
        loading={isLoading}
        reduceMarginTop={!isLoading}
      >
        {selectedEntity && gradingOfSelected && (
          <Box marginTop={2} display='flex'>
            <PointsTable
              className={classes.pointsTable}
              grading={gradingOfSelected}
              sheet={selectedEntity}
              size='medium'
              disablePaper
            />

            {!disableCommentDisplay && (
              <Box className={classes.markdownBox}>
                {studentMarkdown === undefined ? (
                  <LoadingSpinner />
                ) : (
                  <Markdown markdown={studentMarkdown} />
                )}
              </Box>
            )}
          </Box>
        )}
      </Placeholder>
    </Box>
  );
}

export default GradingInformation;
