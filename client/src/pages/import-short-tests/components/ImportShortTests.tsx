import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import ImportCSV from '../../../components/import-csv/components/ImportCSV';
import MapCSVColumns from '../../../components/import-csv/components/map-form/MapCSVColumns';
import { CSVImportProvider } from '../../../components/import-csv/ImportCSV.context';
import { CSVMapColumsMetadata } from '../../../components/import-csv/ImportCSV.types';
import StepperWithButtons from '../../../components/stepper-with-buttons/StepperWithButtons';
import { ROUTES } from '../../../routes/Routing.routes';
import AdjustGeneratedShortTest from './adjust-generated-short-test/AdjustGeneratedShortTest';
import ImportShortTestInformation from './ImportShortTestInformation';
import IliasMappingProvider from './map-students-ilias-names/IliasMapping.context';
import MapStudentsToIliasNames from './map-students-ilias-names/MapStudentsToIliasNames';

export type ShortTestColumns =
  | 'iliasName'
  | 'testResultStudent'
  | 'testMaximumPoints'
  | 'exercises';
type ColumnGroups = 'general';

interface Params {
  shortTestId?: string;
}

function getCSVGroupMetadata(): CSVMapColumsMetadata<ShortTestColumns, ColumnGroups> {
  return {
    information: {
      iliasName: {
        label: 'Ilias-Name',
        group: 'general',
        headersToAutoMap: ['Benutzername', 'Login'],
        required: true,
      },
      testResultStudent: {
        label: 'Testergebnis Studierende',
        group: 'general',
        headersToAutoMap: ['Testergebnis in Punkten', 'Test Results in Points'],
        required: true,
      },
      testMaximumPoints: {
        label: 'Maximale Testpunktzahl',
        group: 'general',
        headersToAutoMap: ['Maximal erreichbare Punktezahl', 'Maximum Available Points'],
        required: true,
      },
      exercises: {
        dynamic: true,
        label: 'Aufgaben des Tests',
        required: true,
      },
    },
    groups: {
      general: { index: 0, name: 'Daten für Studierende' },
    },
  };
}

function ImportShortTests(): JSX.Element {
  const { shortTestId } = useParams<Params>();
  const groupMetadata = useMemo(getCSVGroupMetadata, []);

  return (
    <CSVImportProvider groupMetadata={groupMetadata}>
      <IliasMappingProvider shortTestId={shortTestId}>
        <StepperWithButtons
          steps={[
            {
              label: 'CSV importieren',
              component: (
                <ImportCSV
                  infoLabel='Ergebnisse exportieren'
                  infoContent={<ImportShortTestInformation />}
                />
              ),
            },
            { label: 'Spalten zuordnen', component: <MapCSVColumns /> },
            { label: 'Studierende zuordnen', component: <MapStudentsToIliasNames /> },
            { label: 'Kurztest anpassen', component: <AdjustGeneratedShortTest /> },
          ]}
          backButtonLabel='Zurück'
          nextButtonLabel='Weiter'
          nextButtonDoneLabel='Fertigstellen'
          backButtonRoute={ROUTES.MANAGE_HAND_INS.create({ location: '1' })}
          routeAfterLastStep={{
            route: ROUTES.MANAGE_HAND_INS,
            params: { location: '1' },
          }}
        />
      </IliasMappingProvider>
    </CSVImportProvider>
  );
}

export default ImportShortTests;
