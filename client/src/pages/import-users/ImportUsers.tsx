import React, { useMemo } from 'react';
import ImportCSV from '../../components/import-csv/components/ImportCSV';
import MapCSVColumns from '../../components/import-csv/components/map-form/MapCSVColumns';
import { CSVImportProvider } from '../../components/import-csv/ImportCSV.context';
import { CSVMapColumsMetadata } from '../../components/import-csv/ImportCSV.types';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { ROUTES } from '../../routes/Routing.routes';
import AdjustImportedUserDataForm from './adjust-data-form/AdjustImportedUserDataForm';

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
  const groupMetadata: CSVMapColumsMetadata<UserColumns, ColumnGroups> = useMemo(
    () => ({
      information: {
        firstname: {
          label: 'Vorname',
          headersToAutoMap: ['Vorname'],
          group: 'userInformation',
          required: true,
        },
        lastname: {
          label: 'Nachname',
          headersToAutoMap: ['Nachname', 'Name'],
          group: 'userInformation',
          required: true,
        },
        email: {
          label: 'E-Mailadresse',
          headersToAutoMap: ['E-Mail'],
          group: 'userInformation',
          required: true,
        },
        roles: {
          label: 'Rollen',
          headersToAutoMap: ['Rolle', 'Rollen'],
          group: 'userInformation',
        },
        username: {
          label: 'Nutzername',
          headersToAutoMap: ['Nutzername', 'Username'],
          group: 'credentials',
        },
        password: {
          label: 'Passwort',
          headersToAutoMap: ['Passwort'],
          group: 'credentials',
        },
        tutorials: {
          label: 'Tutorien',
          headersToAutoMap: ['Tutorien', 'Tutorium'],
          group: 'tutorialInformation',
        },
        tutorialsToCorrect: {
          label: 'Tutorien zum Korrigieren',
          headersToAutoMap: ['Korrektur'],
          group: 'tutorialInformation',
        },
      },
      groups: {
        userInformation: { name: 'Nutzerinformationen', index: 0 },
        tutorialInformation: { name: 'Informationen über Tutorien', index: 1 },
        credentials: { name: 'Zugangsdaten', index: 2 },
      },
    }),
    []
  );

  return (
    <CSVImportProvider groupMetadata={groupMetadata}>
      <StepperWithButtons
        steps={[
          { label: 'CSV importieren', component: <ImportCSV /> },
          { label: 'Spalten zuordnen', component: <MapCSVColumns /> },
          { label: 'Nutzer importieren', component: <AdjustImportedUserDataForm /> },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={ROUTES.MANAGE_USERS.create({})}
        routeAfterLastStep={{ route: ROUTES.MANAGE_USERS, params: {} }}
      />
    </CSVImportProvider>
  );
}

export default ImportUsers;
