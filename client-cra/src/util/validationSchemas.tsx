import * as Yup from 'yup';

// Big thanks to the article of Nic Raboy (https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/) to explain the regex used in this validation schema.
export const passwordValidationSchema = Yup.string()
  .required('Benötigt')
  .min(8, 'Password muss mindestens 8 Zeichen lang sein.')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])/, 'Muss Groß- und Kleinbuchstaben enthalten.')
  .matches(/^(?=.*[0-9])/, 'Muss mindestens eine Zahl enthalten.');
// .matches(
//   /^(?=.*[!@#\$%\^&])/,
//   'Muss mindestens ein Sonderzeichen (!, @, #, $, %, ^, &) enthalten.'
// );
