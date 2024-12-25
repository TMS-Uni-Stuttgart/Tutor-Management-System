import { Button, Chip, TableCell } from '@mui/material';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { DateTime } from 'luxon';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import { renderLink } from '../../../components/navigation-rail/components/renderLink';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { Tutorial } from '../../../model/Tutorial';
import { ROUTES } from '../../../routes/Routing.routes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorChip: {
      margin: theme.spacing(0.5),
    },
    labelCell: {
      width: '1%',
      whiteSpace: 'nowrap',
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
  tutors: string[];
  substitutes: Substitute[];
  correctors: string[];
  onEditTutorialClicked: (tutorial: Tutorial) => void;
  onDeleteTutorialClicked: (tutorial: Tutorial) => void;
  disableManageTutorialButton?: boolean;
}

function TutorialTableRow({
  tutorial,
  tutors,
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
            component={renderLink(
              ROUTES.MANAGE_TUTORIAL_INTERNALS.buildPath({
                tutorialId: tutorial.id,
              })
            )}
            disabled={disableManageTutorialButton}
          >
            Verwalten
          </Button>

          <Button
            variant='outlined'
            className={classes.substituteButton}
            component={renderLink(
              ROUTES.MANAGE_TUTORIAL_SUBSTITUTES.buildPath({
                tutorialId: tutorial.id,
              })
            )}
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
      LabelCellProps={{ className: classes.labelCell }}
      {...rest}
    >
      <TableCell>
        <div>
          {tutors.length > 0 && (
            <div>
              {tutors.map((tut) => (
                <Chip
                  key={tut}
                  label={`Tutor: ${tut}`}
                  className={classes.tutorChip}
                  color='primary'
                />
              ))}
            </div>
          )}

          {correctors.length > 0 && (
            <div>
              {correctors.map((cor) => (
                <Chip
                  key={cor}
                  label={`Korrektor: ${cor}`}
                  className={classes.tutorChip}
                  size={tutorial.tutors ? 'small' : 'medium'}
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
