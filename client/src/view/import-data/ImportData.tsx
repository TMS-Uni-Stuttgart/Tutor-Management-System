import React from 'react';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import GenerateTutorials from './generate-tutorials/GenerateTutorials';
import ImportUsers from './import-users/ImportUsers';
import ImportDataContext from './ImportData.context';

function ImportData(): JSX.Element {
  return (
    <ImportDataContext>
      <StepperWithButtons
        steps={[
          // { label: 'Tutorien generieren', component: GenerateTutorials, skippable: true },
          { label: 'Nutzer importieren', component: ImportUsers },
          { label: 'Abschließen', component: () => <div>DONE</div> },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
      />
    </ImportDataContext>
  );
}

export default ImportData;
