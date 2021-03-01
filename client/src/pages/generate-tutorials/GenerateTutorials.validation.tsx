import { DateTime, Interval } from 'luxon';
import * as Yup from 'yup';
import { TestContext, TestFunction, ValidationError } from 'yup';
import { FormExcludedDate } from './components/excluded-dates/FormikExcludedDates';
import { WeekdayTimeSlot } from './components/weekday-slots/FormikWeekdaySlot';
import { FormState } from './GenerateTutorials';

function isDateTime(this: TestContext, value: unknown): boolean | ValidationError {
  if (typeof value !== 'string') {
    return this.createError({
      message: 'Muss eine Zeichenkette sein.',
    });
  }

  const date = DateTime.fromISO(value);

  return date.isValid;
}

function isAfterStartDay(field: string): TestFunction {
  return function (this, value: unknown) {
    if (typeof value !== 'string') {
      return this.createError({
        message: 'Muss eine Zeichenkette sein.',
      });
    }

    const startDate: DateTime = DateTime.fromISO(this.resolve(Yup.ref(field)));
    const endDate: DateTime = DateTime.fromISO(value);

    return startDate.toMillis() < endDate.toMillis();
  };
}

const excludedDateSchema = Yup.object<FormExcludedDate>()
  .test('excludedDate', `Not a valid excluded date`, (obj) => {
    if (obj instanceof DateTime) {
      return obj.isValid;
    } else if (obj instanceof Interval) {
      return obj.isValid;
    }

    return false;
  })
  .required();

const singleWeekdaySlotSchema = Yup.object().shape<WeekdayTimeSlot>({
  _id: Yup.number().required('Benötigt'),
  count: Yup.string()
    .matches(/^\d+(\.\d+)?$/, 'Count muss eine Zahl sein')
    .required('Benötigt'),
  interval: Yup.object<Interval>()
    .test('is-interval', 'Is not a valid luxon Interval', function (this, obj) {
      if (!(obj instanceof Interval)) {
        return this.createError({ message: 'Not a luxon Interval object.' });
      }

      if (!obj.isValid) {
        return this.createError({ message: 'Not a valid luxon Interval.' });
      }

      if (obj.start >= obj.end) {
        return this.createError({ message: 'End time must be greater than start time' });
      }

      return true;
    })
    .required('Benötigt'),
});

function areWeekdaysValid(this: Yup.TestContext, value: unknown, path: string) {
  if (!(value instanceof Array)) {
    throw this.createError({ path, message: 'Value is not an array.' });
  }

  value.forEach((val, idx) => {
    const pathPrefix = `${path}[${idx}]`;
    try {
      singleWeekdaySlotSchema.validateSync(val);
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        throw this.createError({
          message: validationError.message,
          path: `${pathPrefix}.${validationError.path}`,
        });
      } else {
        throw validationError;
      }
    }
  });
}

const weekdaysSchema = Yup.object<FormState['weekdays']>()
  .test('weekdays', 'Keine gültige Slotkonfiguration.', function (this, obj) {
    if (!obj) {
      return this.createError({ message: 'Muss definiert sein.' });
    }

    const entries = Object.entries(obj);
    const inner: ValidationError[] = [];

    if (entries.length === 0) {
      return this.createError({ message: 'Kein Slot vorhanden.' });
    }

    for (const [key, value] of entries) {
      try {
        areWeekdaysValid.bind(this)(value, `${this.path}.${key}`);
      } catch (validationError) {
        inner.push(validationError);
      }
    }

    if (inner.length > 0) {
      const error = this.createError({ message: 'Keine gültige Slotkonfiguration.' });
      error.inner = inner;

      return error;
    } else {
      return true;
    }
  })
  .required('Benötigt');

const prefixesSchema = Yup.object<FormState['prefixes']>()
  .test('prefixes', 'Keine gültigen Präfixe', function (this, obj) {
    if (!obj) {
      return this.createError({ message: 'Muss definiert sein.' });
    }

    if (typeof obj !== 'object') {
      return this.createError({ message: 'Ist nicht vom Typ "object"' });
    }

    const inner: Yup.ValidationError[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (!value) {
        inner.push(
          this.createError({
            message: `Präfix wird benötigt.`,
            path: `${this.path}.${key}`,
          })
        );
      } else if (typeof value !== 'string') {
        inner.push(
          this.createError({
            message: `Präfix ist kein String.`,
            path: `${this.path}.${key}`,
          })
        );
      }
    }

    if (inner.length > 0) {
      const error = this.createError({ message: 'Ungültige Präfixe.' });
      error.inner = inner;
      return error;
    }

    return true;
  })
  .required('Benötigt');

export const validationSchema = Yup.object().shape<FormState>({
  startDate: Yup.string()
    .required('Benötigt')
    .test({ test: isDateTime, message: 'Ungültiges Datum' }),
  endDate: Yup.string()
    .required('Benötigt')
    .test({ test: isDateTime, message: 'Ungültiges Datum' })
    .test({ test: isAfterStartDay('startDate'), message: 'Muss nach dem Startdatum liegen' }),
  excludedDates: Yup.array<FormExcludedDate>().of(excludedDateSchema).defined(),
  weekdays: weekdaysSchema,
  prefixes: prefixesSchema,
});
