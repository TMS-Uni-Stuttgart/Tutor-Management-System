import { Button, Chip, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DateTime } from 'luxon';
import React from 'react';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { Tutorial } from '../../../model/Tutorial';
import { ROUTES } from '../../../routes/Routing.routes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorChip: {
      margin: theme.spacing(0.5),
    },
    substituteButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Substitute {
  date: DateTime;
  name: string;
}

interface Props extends PaperTableRowProps {
  tutorial: Tutorial;
  substitutes: Substitute[];
  correctors: string[];
  onEditTutorialClicked: (tutorial: Tutorial) => void;
  onDeleteTutorialClicked: (tutorial: Tutorial) => void;
  disableManageTutorialButton?: boolean;
}

function TutorialTableRow({
  tutorial,
  substitutes,
  correctors,
  onEditTutorialClicked,
  onDeleteTutorialClicked,
  disableManageTutorialButton,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();

  const disableDelete: boolean = tutorial.students.length > 0;

  return (
    <PaperTableRow
      label={tutorial.toDisplayString()}
      subText={`Zeit: ${tutorial.getTimeString()}`}
      buttonCellContent={
        <>
          <Button
            variant='outlined'
            className={classes.substituteButton}
            component={ROUTES.MANAGE_TUTORIAL_INTERNALS.renderLink({
              tutorialId: tutorial.id,
            })}
            disabled={disableManageTutorialButton}
          >
            Verwalten
          </Button>

          <Button
            variant='outlined'
            className={classes.substituteButton}
            component={ROUTES.MANAGE_TUTORIAL_SUBSTITUTES.renderLink({
              tutorialId: tutorial.id,
            })}
          >
            Vertretungen
          </Button>

          <EntityListItemMenu
            onEditClicked={() => onEditTutorialClicked(tutorial)}
            onDeleteClicked={() => onDeleteTutorialClicked(tutorial)}
            disableDelete={disableDelete}
            deleteTooltip={disableDelete ? 'Tutorium hat Studierende.' : undefined}
          />
        </>
      }
      {...rest}
    >
      <TableCell>
        <div>
          {tutorial.tutor && (
            <Chip
              key={tutorial.id}
              label={`Tutor: ${tutorial.tutor.lastname}, ${tutorial.tutor.firstname}`}
              className={classes.tutorChip}
              color='primary'
            />
          )}

          {correctors.length > 0 && (
            <div>
              {correctors.map((cor) => (
                <Chip
                  key={cor}
                  label={`Korrektor: ${cor}`}
                  className={classes.tutorChip}
                  size={!!tutorial.tutor ? 'small' : 'medium'}
                />
              ))}
            </div>
          )}
        </div>

        {substitutes.length > 0 && (
          <div>
            {substitutes.map((sub) => (
              <Chip
                key={sub.date.toISO() ?? 'DATE_NOTE_PARSEABLE'}
                label={`Vertr. ${sub.date.toFormat('dd.MM.yy')}: ${sub.name}`}
                className={classes.tutorChip}
              />
            ))}
          </div>
        )}
      </TableCell>
    </PaperTableRow>
  );
}

export default TutorialTableRow;
