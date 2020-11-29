import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import ImportCSV from '../../components/import-csv-new/components/ImportCSV';
import { CSVImportProvider } from '../../components/import-csv-new/ImportCSV.context';
import { CSVMapColumsMetadata } from '../../components/import-csv-new/ImportCSV.types';
import { MapColumnsData } from '../../components/import-csv/ImportCSV.types';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { ROUTES } from '../../routes/Routing.routes';

export type ShortTestColumns = 'iliasName' | 'testResultStudent' | 'testMaximumPoints';
type ColumnGroups = 'general';

interface Params {
  shortTestId?: string;
}

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
    },
    groups: {
      general: { index: 0, name: 'Spalten' },
    },
  };
}

function ImportShortTests(): JSX.Element {
  const { shortTestId } = useParams<Params>();
  const groupMetadata = useMemo(getCSVGroupMetadata, []);

  return (
    <CSVImportProvider groupMetadata={groupMetadata}>
      <StepperWithButtons
        steps={[
          // FIXME: Re-Add instructions
          // { label: 'Export-Anleitung', component: ImportShortTestInformation },
          { label: 'CSV importieren', component: ImportCSV },
          // { label: 'Spalten zuordnen', component: MapCSVColumnsWithStepper },
          // { label: 'Studierende zuordnen', component: MapStudentsToIliasNames },
          // { label: 'Kurztest anpassen', component: AdjustGeneratedShortTest },
        ]}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={ROUTES.MANAGE_HAND_INS.create({ location: '1' })}
      />
    </CSVImportProvider>
  );
}

// function ImportShortTests(): JSX.Element {
//   const { shortTestId } = useParams<Params>();
//   const mapColumnData = useMemo(getMapColumnData, []);

//   return (
//     <ImportCSVContext mapColumnsData={mapColumnData}>
//       <IliasMappingProvider shortTestId={shortTestId}>
//         <StepperWithButtons
//           steps={[
//             { label: 'Export-Anleitung', component: ImportShortTestInformation },
//             { label: 'CSV importieren', component: ImportCSVWithStepper },
//             { label: 'Spalten zuordnen', component: MapCSVColumnsWithStepper },
//             { label: 'Studierende zuordnen', component: MapStudentsToIliasNames },
//             { label: 'Kurztest anpassen', component: AdjustGeneratedShortTest },
//           ]}
//           backButtonLabel='Zurück'
//           nextButtonLabel='Weiter'
//           nextButtonDoneLabel='Fertigstellen'
//           backButtonRoute={ROUTES.MANAGE_HAND_INS.create({ location: '1' })}
//         />
//       </IliasMappingProvider>
//     </ImportCSVContext>
//   );
// }

export default ImportShortTests;
