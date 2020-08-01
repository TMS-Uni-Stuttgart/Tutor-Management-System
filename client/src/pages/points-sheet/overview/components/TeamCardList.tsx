import React from 'react';
import CardList from '../../../../components/cardlist/CardList';
import { Sheet } from '../../../../model/Sheet';
import { Team } from '../../../../model/Team';
import TeamCard from './TeamCard';
import Placeholder from '../../../../components/Placeholder';

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
    <Placeholder placeholderText='Keine Teams verfügbar.' showPlaceholder={teams.length === 0}>
      <CardList>
        {teams.map((team) => (
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
    </Placeholder>
  );
}

export default TeamCardList;
