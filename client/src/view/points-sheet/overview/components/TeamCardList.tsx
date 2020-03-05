import React from 'react';
import { ISheet } from 'shared/model/Sheet';
import { ITeam } from 'shared/model/Team';
import CardList from '../../../../components/cardlist/CardList';
import TeamCard from './TeamCard';

interface Props {
  tutorialId: string;
  teams: ITeam[];
  sheet: ISheet;
  onPdfPreviewClicked: (team: ITeam) => void;
  onGeneratePdfClicked: (team: ITeam) => void;
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
