import { IClientSettings } from 'shared/model/Settings';
import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  canTutorExcuseStudents: Yup.boolean().required('Benötigt'),
  defaultTeamSize: Yup.number()
    .integer('Muss eine ganze Zahl sein.')
    .min(1, 'Muss mindestens 1 sein.')
    .required('Benötigt'),
  gradingFilename: Yup.string().required('Benötigt'),
  mailingConfig: Yup.lazy((value: { enabled?: boolean } | undefined | null) => {
    if (value?.enabled) {
      return Yup.object().shape({
        enabled: Yup.boolean().defined(),
        host: Yup.string().required('Benötigt'),
        subject: Yup.string().required('Benötigt'),
        port: Yup.number()
          .positive('Muss eine positive Zahl sein')
          .integer('Muss eine ganze Zahl sein')
          .required('Benötigt'),
        auth: Yup.object().shape({
          user: Yup.string().required('Benötigt.'),
          pass: Yup.string().required('Benötigt.'),
        }),
        from: Yup.string()
          .required('Benötigt')
          .test({
            name: 'isValidFrom',
            message: 'Muss entweder in der Form "{email}" oder "{name} <{email}>" sein',
            test: (value) => {
              if (typeof value !== 'string') {
                return false;
              }

              const regexMail = /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/;
              const regexName = /([\p{L}\p{N}",*-]|[^\S\r\n])+/;
              const regex = new RegExp(
                `^(${regexMail.source})|(${regexName.source} <${regexMail.source}>)$`,
                'u'
              );
              return regex.test(value);
            },
          }),
      });
    } else {
      return Yup.mixed();
    }
  }),
});

export interface FormState {
  defaultTeamSize: string;
  canTutorExcuseStudents: boolean;
  gradingFilename: string;
  tutorialGradingFilename: string;
  mailingConfig: {
    enabled: boolean;
    from: string;
    host: string;
    port: string;
    subject: string;
    auth: { user: string; pass: string };
  };
}

export function getInitialValues(settings: IClientSettings): FormState {
  const {
    mailingConfig,
    canTutorExcuseStudents,
    gradingFilename,
    tutorialGradingFilename,
    defaultTeamSize,
  } = settings;
  return {
    canTutorExcuseStudents: canTutorExcuseStudents,
    defaultTeamSize: `${defaultTeamSize}`,
    gradingFilename,
    tutorialGradingFilename,
    mailingConfig: {
      enabled: !!mailingConfig,
      from: mailingConfig?.from ?? '',
      host: mailingConfig?.host ?? '',
      port: `${mailingConfig?.port ?? '587'}`,
      subject: mailingConfig?.subject ?? 'TMS Zugangsdaten',
      auth: { user: mailingConfig?.auth.user ?? '', pass: mailingConfig?.auth.pass ?? '' },
    },
  };
}

export function convertFormStateToDTO(values: FormState): IClientSettings {
  const dto: IClientSettings = {
    canTutorExcuseStudents: values.canTutorExcuseStudents,
    defaultTeamSize: Number.parseInt(values.defaultTeamSize),
    gradingFilename: values.gradingFilename,
    tutorialGradingFilename: values.tutorialGradingFilename,
  };

  if (values.mailingConfig.enabled) {
    const { from, host, port, auth, subject } = values.mailingConfig;
    dto.mailingConfig = {
      from,
      host,
      subject,
      port: Number.parseInt(port),
      auth: { user: auth.user, pass: auth.pass },
    };
  }

  return dto;
}
