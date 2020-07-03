import React from 'react';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import AdjustImportedUserDataForm from './adjust-data-form/AdjustImportedUserDataForm';
import ImportUserCSV from './import-csv/ImportUserCSV';
import ImportUsersContext from './ImportUsers.context';
import MapCSVColumns from './map-columns/MapCSVColumns';
import { ROUTES } from '../../routes/newVersion/Routing.routes';

function ImportUsers(): JSX.Element {
  return (
    <ImportUsersContext>
      <StepperWithButtons
        steps={[
          { label: 'CSV importieren', component: ImportUserCSV },
          { label: 'Spalten zuordnen', component: MapCSVColumns },
          { label: 'Nutzer importieren', component: AdjustImportedUserDataForm },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={ROUTES.MANAGE_USERS.create({})}
      />
    </ImportUsersContext>
  );
}

export default ImportUsers;
