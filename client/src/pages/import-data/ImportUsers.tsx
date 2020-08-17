import React from 'react';
import ImportCSVContext, { MapColumnsData } from '../../components/import-csv/ImportCSV.context';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { ROUTES } from '../../routes/Routing.routes';
import AdjustImportedUserDataForm from './adjust-data-form/AdjustImportedUserDataForm';
import ImportUserCSV from './import-csv/ImportUserCSV';
import MapUserCSVColumns from './map-columns/MapUserCSVColumns';

export type UserColumns =
  | 'firstname'
  | 'lastname'
  | 'email'
  | 'roles'
  | 'username'
  | 'password'
  | 'tutorials'
  | 'tutorialsToCorrect';
type ColumnGroups = 'userInformation' | 'tutorialInformation' | 'credentials';

function ImportUsers(): JSX.Element {
  const mapColumnData: MapColumnsData<UserColumns, ColumnGroups> = {
    information: {
      firstname: {
        label: 'Vorname',
        mapName: ['Vorname'],
        group: 'userInformation',
        required: true,
      },
      lastname: {
        label: 'Nachname',
        mapName: ['Nachname', 'Name'],
        group: 'userInformation',
        required: true,
      },
      email: {
        label: 'E-Mailadresse',
        mapName: ['E-Mail'],
        group: 'userInformation',
        required: true,
      },
      roles: { label: 'Rollen', mapName: ['Rolle', 'Rollen'], group: 'userInformation' },
      username: {
        label: 'Nutzername',
        mapName: ['Nutzername', 'Username'],
        group: 'credentials',
      },
      password: { label: 'Passwort', mapName: ['Passwort'], group: 'credentials' },
      tutorials: {
        label: 'Tutorien',
        mapName: ['Tutorien', 'Tutorium'],
        group: 'tutorialInformation',
      },
      tutorialsToCorrect: {
        label: 'Tutorien zum Korrigieren',
        mapName: ['Korrektur'],
        group: 'tutorialInformation',
      },
    },
    groups: {
      userInformation: { name: 'Nutzerinformationen', index: 0 },
      tutorialInformation: { name: 'Informationen über Tutorien', index: 1 },
      credentials: { name: 'Zugangsdaten', index: 2 },
    },
  };

  return (
    <ImportCSVContext mapColumnsData={mapColumnData}>
      <StepperWithButtons
        steps={[
          { label: 'CSV importieren', component: ImportUserCSV },
          { label: 'Spalten zuordnen', component: MapUserCSVColumns },
          { label: 'Nutzer importieren', component: AdjustImportedUserDataForm },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={ROUTES.MANAGE_USERS.create({})}
      />
    </ImportCSVContext>
  );
}

export default ImportUsers;
