import { StudentStatus } from 'shared/model/Student';
import { CSVData, CSVMappedColumns } from '../../../../components/import-csv/ImportCSV.types';
import { StudentColumns } from '../../ImportStudents';
import { StudentFormState } from '../AdjustImportedStudentDataForm';

interface ConversionParams {
    data: CSVData;
    values: CSVMappedColumns<StudentColumns>;
}

function convertColumnToStatus(statusData?: string): StudentStatus {
    const sanitized = statusData?.trim()?.toUpperCase();
    const status = Object.values(StudentStatus).find((status) => sanitized === status.toString());
    return status ?? StudentStatus.ACTIVE;
}

export function convertCSVDataToFormData(params: ConversionParams): StudentFormState {
    const { data, values } = params;
    const emptyString = 'N/A';

    const userFormState: StudentFormState = {};
    data.rows.forEach(({ rowNr, data }) => {
        const key = rowNr.toString();
        userFormState[key] = {
            rowNr,
            firstname: data[values.firstname as string]?.trim() || emptyString,
            lastname: data[values.lastname as string]?.trim() || emptyString,
            email: data[values.email as string]?.trim() || undefined,
            status: convertColumnToStatus(data[values.status as string]),
            team: data[values.team as string]?.trim(),
            iliasName: data[values.iliasName as string]?.trim() || undefined,
            matriculationNo: data[values.matriculationNo as string] || undefined,
            courseOfStudies: data[values.courseOfStudies as string] || undefined,
        };
    });

    return userFormState;
}
