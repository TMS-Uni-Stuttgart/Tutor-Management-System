import React from 'react';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { RoutingPath } from '../../routes/Routing.routes';
import ImportUsers from './import-users/ImportUsers';
import ImportDataContext from './ImportData.context';

function ImportData(): JSX.Element {
  return (
    <ImportDataContext>
      <StepperWithButtons
        steps={[
          { label: 'CSV importieren', component: () => <div>NONE</div> },
          { label: 'Nutzer importieren', component: ImportUsers },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={RoutingPath.MANAGE_USERS}
      />
    </ImportDataContext>
  );
}

export default ImportData;
