import React, { useMemo } from 'react';
import ImportCSVWithStepper from '../../components/import-csv/components/ImportCSVWithStepper';
import MapCSVColumnsWithStepper from '../../components/import-csv/components/MapCSVColumnsWithStepper';
import ImportCSVContext from '../../components/import-csv/ImportCSV.context';
import { MapColumnsData } from '../../components/import-csv/ImportCSV.types';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { ROUTES } from '../../routes/Routing.routes';
import AdjustGeneratedShortTest from './components/AdjustGeneratedShortTest';
import ImportShortTestInformation from './components/ImportShortTestInformation';
import IliasMappingProvider from './components/map-students-ilias-names/IliasMapping.context';
import MapStudentsToIliasNames from './components/map-students-ilias-names/MapStudentsToIliasNames';

export type ShortTestColumns = 'iliasName' | 'testResultStudent' | 'testMaximumPoints';
type ColumnGroups = 'general';

function getMapColumnData(): MapColumnsData<ShortTestColumns, ColumnGroups> {
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
    },
    groups: {
      general: { index: 0, name: 'Spalten' },
    },
  };
}

function ImportShortTests(): JSX.Element {
  const mapColumnData = useMemo(getMapColumnData, []);

  return (
    <ImportCSVContext mapColumnsData={mapColumnData}>
      <IliasMappingProvider>
        <StepperWithButtons
          steps={[
            { label: 'Export-Anleitung', component: ImportShortTestInformation },
            { label: 'CSV importieren', component: ImportCSVWithStepper },
            { label: 'Spalten zuordnen', component: MapCSVColumnsWithStepper },
            { label: 'Studierende zuordnen', component: MapStudentsToIliasNames },
            { label: 'Kurztest anpassen', component: AdjustGeneratedShortTest },
          ]}
          backButtonLabel='Zurück'
          nextButtonLabel='Weiter'
          nextButtonDoneLabel='Fertigstellen'
          backButtonRoute={ROUTES.MANAGE_HAND_INS.create({ location: '1' })}
        />
      </IliasMappingProvider>
    </ImportCSVContext>
  );
}

export default ImportShortTests;
