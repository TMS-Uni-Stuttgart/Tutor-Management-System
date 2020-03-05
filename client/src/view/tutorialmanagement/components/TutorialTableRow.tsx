import { Button, Chip, TableCell } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { renderLink } from '../../../components/drawer/components/renderLink';
import { RoutingPath } from '../../../routes/Routing.routes';
import { getDisplayStringForTutorial } from '../../../util/helperFunctions';
import { ITutorial } from '../../../../../server/src/shared/model/Tutorial';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tutorChip: {
      margin: theme.spacing(0.5),
    },
    wrappingCell: {
      // whiteSpace: 'pre-line',
    },
    substituteButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Substitute {
  date: Date;
  name: string;
}

interface Props extends PaperTableRowProps {
  tutorial: ITutorial;
  substitutes: Substitute[];
  correctors: string[];
  onEditTutorialClicked: (tutorial: ITutorial) => void;
  onDeleteTutorialClicked: (tutorial: ITutorial) => void;
}

function TutorialTableRow({
  tutorial,
  substitutes,
  correctors,
  onEditTutorialClicked,
  onDeleteTutorialClicked,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();

  const disableDelete: boolean = tutorial.students.length > 0;

  return (
    <PaperTableRow
      label={getDisplayStringForTutorial(tutorial)}
      buttonCellContent={
        <>
          <Button
            variant='outlined'
            className={classes.substituteButton}
            component={renderLink(
              RoutingPath.MANAGE_TUTORIALS_SUBSTITUTES.replace(':tutorialid', tutorial.id)
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
      {...rest}
    >
      <TableCell className={classes.wrappingCell}>
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
            <>
              {correctors.map(cor => (
                <Chip
                  key={cor}
                  label={`Korrektor: ${cor}`}
                  color='secondary'
                  className={classes.tutorChip}
                />
              ))}
            </>
          )}
        </div>

        {substitutes.length > 0 && (
          <div>
            {substitutes.map(sub => (
              <Chip
                key={sub.date.toISOString()}
                label={`Vertr. ${format(sub.date, 'dd.MM.yy')}: ${sub.name}`}
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
