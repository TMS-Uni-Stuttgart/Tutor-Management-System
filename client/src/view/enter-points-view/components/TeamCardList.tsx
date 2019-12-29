import React from 'react';
import { Team } from 'shared/dist/model/Team';
import TeamCard from './TeamCard';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Sheet } from 'shared/dist/model/Sheet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'grid',
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '100%',
      },
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: 'repeat(auto-fit, calc(100% / 2))',
      },
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: 'repeat(auto-fit, calc(100% / 3))',
      },
      [theme.breakpoints.up('xl')]: {
        gridTemplateColumns: 'repeat(auto-fit, calc(100% / 4))',
      },
      marginBottom: theme.spacing(2),
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  })
);

interface Props {
  teams: Team[];
  sheet: Sheet;
  onPdfPreviewClicked: (team: Team) => void;
  onGeneratePdfClicked: (team: Team) => void;
}

function TeamCardList({
  teams,
  sheet,
  onPdfPreviewClicked,
  onGeneratePdfClicked,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          sheet={sheet}
          onPdfPreviewClicked={onPdfPreviewClicked}
          onGeneratePdfClicked={onGeneratePdfClicked}
        />
      ))}
    </div>
  );
}

export default TeamCardList;
