import { DateTime } from 'luxon';
import * as Yup from 'yup';
import { TestContext, TestFunction } from 'yup';
import { FormExcludedDate } from './components/excluded-dates/FormikExcludedDates';
import { FormState } from './GenerateTutorials';

function isDateTime(this: TestContext, value: string): boolean {
  const date = DateTime.fromISO(value);

  return date.isValid;
}

function isAfterStartDay(field: string): TestFunction {
  return function (this, value: string) {
    const startDate: DateTime = DateTime.fromISO(this.resolve(Yup.ref(field)));
    const endDate: DateTime = DateTime.fromISO(value);

    return startDate.toMillis() < endDate.toMillis();
  };
}

export const validationSchema = Yup.object().shape<FormState>({
  startDate: Yup.string()
    .required('Benötigt')
    .test({ test: isDateTime, message: 'Ungültiges Datum' }),
  endDate: Yup.string()
    .required('Benötigt')
    .test({ test: isDateTime, message: 'Ungültiges Datum' })
    .test({ test: isAfterStartDay('startDate'), message: 'Muss nach dem Startdatum liegen' }),
  excludedDates: Yup.array<FormExcludedDate>().required('Benötigt'),
  weekdays: Yup.object<FormState['weekdays']>().required('Benötigt'),
});
