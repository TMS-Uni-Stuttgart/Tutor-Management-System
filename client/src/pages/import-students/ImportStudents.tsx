import { useMemo } from 'react';
import { useParams } from 'react-router';
import ImportCSV from '../../components/import-csv/components/ImportCSV';
import MapCSVColumns from '../../components/import-csv/components/map-form/MapCSVColumns';
import { CSVImportProvider } from '../../components/import-csv/ImportCSV.context';
import { CSVMapColumsMetadata } from '../../components/import-csv/ImportCSV.types';
import StepperWithButtons from '../../components/stepper-with-buttons/StepperWithButtons';
import { ROUTES } from '../../routes/Routing.routes';
import AdjustImportedStudentDataForm from './adjust-data-form/AdjustImportedStudentDataForm';

export type StudentColumns =
  | 'firstname'
  | 'lastname'
  | 'status'
  | 'team'
  | 'email'
  | 'iliasName'
  | 'matriculationNo'
  | 'courseOfStudies';
type ColumnGroups = 'studentInformation';

interface Params {
  tutorialId: string;
}

function ImportStudents(): JSX.Element {
  const { tutorialId } = useParams<Params>();
  const groupMetadata: CSVMapColumsMetadata<StudentColumns, ColumnGroups> = useMemo(
    () => ({
      information: {
        firstname: {
          label: 'Vorname',
          headersToAutoMap: ['Vorname'],
          group: 'studentInformation',
          required: true,
        },
        lastname: {
          label: 'Nachname',
          headersToAutoMap: ['Nachname', 'Name'],
          group: 'studentInformation',
          required: true,
        },
        status: {
          label: 'Status',
          headersToAutoMap: ['Status'],
          group: 'studentInformation',
          required: false,
        },
        team: {
          label: 'Team',
          headersToAutoMap: ['Team'],
          group: 'studentInformation',
          required: false,
        },
        email: {
          label: 'E-Mailadresse',
          headersToAutoMap: ['E-Mail'],
          group: 'studentInformation',
          required: false,
        },
        iliasName: {
          label: 'Ilias-Name',
          headersToAutoMap: ['Ilias', 'Ilias-Name', 'IliasName'],
          group: 'studentInformation',
          required: false,
        },
        matriculationNo: {
          label: 'Matrikelnummer',
          headersToAutoMap: ['Matrikelnummer'],
          group: 'studentInformation',
          required: false,
        },
        courseOfStudies: {
          label: 'Studiengang',
          headersToAutoMap: ['Studiengang'],
          group: 'studentInformation',
          required: false,
        },
      },
      groups: {
        studentInformation: { name: 'Studierendenformationen', index: 0 },
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
          {
            label: 'Studierende importieren',
            component: <AdjustImportedStudentDataForm tutorialId={tutorialId} />,
          },
        ]}
        alternativeLabel={false}
        backButtonLabel='Zurück'
        nextButtonLabel='Weiter'
        nextButtonDoneLabel='Fertigstellen'
        backButtonRoute={ROUTES.STUDENTOVERVIEW.create({ tutorialId })}
        routeAfterLastStep={{ route: ROUTES.STUDENTOVERVIEW, params: { tutorialId } }}
      />
    </CSVImportProvider>
  );
}

export default ImportStudents;
