import React from 'react';
import { Sheet } from 'shared/model/Sheet';
import { Team } from 'shared/model/Team';
import CardList from '../../../../components/cardlist/CardList';
import TeamCard from './TeamCard';

interface Props {
  tutorialId: string;
  teams: Team[];
  sheet: Sheet;
  onPdfPreviewClicked: (team: Team) => void;
  onGeneratePdfClicked: (team: Team) => void;
}

function TeamCardList({
  tutorialId,
  teams,
  sheet,
  onPdfPreviewClicked,
  onGeneratePdfClicked,
}: Props): JSX.Element {
  return (
    <CardList>
      {teams.map(team => (
        <TeamCard
          key={team.id}
          tutorialId={tutorialId}
          team={team}
          sheet={sheet}
          onPdfPreviewClicked={onPdfPreviewClicked}
          onGeneratePdfClicked={onGeneratePdfClicked}
        />
      ))}
    </CardList>
  );
}

export default TeamCardList;
