import React from 'react';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { RoutingPath } from '../../routes/Routing.routes';
import AdjustImportedUserDataForm from './adjust-data-form/AdjustImportedUserDataForm';
import ImportUserCSV from './import-csv/ImportUserCSV';
import ImportUsersContext from './ImportUsers.context';

function ImportUsers(): JSX.Element {
  return (
    <ImportUsersContext>
      <StepperWithButtons
        steps={[
          { label: 'CSV importieren', component: ImportUserCSV },
          { label: 'Spalten zuordnen', component: () => <div>SPALTEN_ZUORDNEN</div> },
          { label: 'Nutzer importieren', component: AdjustImportedUserDataForm },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={RoutingPath.MANAGE_USERS}
      />
    </ImportUsersContext>
  );
}

export default ImportUsers;
