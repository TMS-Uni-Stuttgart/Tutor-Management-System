import React from 'react';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import GenerateTutorials from './generate-tutorials/GenerateTutorials';
import ImportUsers from './import-users/ImportUsers';

function ImportData(): JSX.Element {
  return (
    <StepperWithButtons
      steps={[
        { label: 'Tutorien generieren', component: GenerateTutorials },
        { label: 'Nutzer importieren', component: ImportUsers },
        { label: 'Abschließen', component: () => <div>DONE</div> },
      ]}
      alternativeLabel={false}
      backButtonLabel='Zurück'
      nextButtonLabel='Weiter'
      nextButtonDoneLabel='Fertigstellen'
    />
  );
}

export default ImportData;
