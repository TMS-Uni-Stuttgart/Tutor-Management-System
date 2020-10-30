---
id: settings
title: Settings
sidebar_label: Settings
---

import Roles from '../../src/components/roles/Roles';

<Roles roles={['admin']} />

All settings descriped here are configurable by the administrator through a special page on the client.
One can configure those through the configuration file on the first setup, too, but it is not required to do so.

For a complete overview of all configuration options available see the [Configuration page][config-doc].

## Available settings

| Setting                  | Default      | Description                                                                                                                                                                                                         |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultTeamSize`        | `2`          | Size of a 'default team'. Teams are **not** validated against this constraint but the client uses it for Quality of Life adjustments.                                                                               |
| `canTutorExcuseStudents` | `false`      | Are tutors able to excuse their students? If this is `true` they can set the attendance state of their students to `excused`. If this is `false` only the administrator can set the attendance states to `excused`. |
| `mailingConfig`          | _(optional)_ | `MailingConfiguration` - Options for [nodemailer][nodemailer]. For more information see below.                                                                                                                      |

### Mailing Configuration

The following table contains the options available for the mailing configuration, a short description and their default value (if they are optional).

| Option    | Default       | Description                                                                                                                                       |
| --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`    | `'localhost'` | `string` - Hostname of the IP address of the mail server.                                                                                         |
| `port`    | `587`         | `number` - Port used by the mail server. The default depends on the `secure` setting.                                                             |
| `from`    | `''`          | `string` - Used as the sender of the mail. Must be either a valid email or a string with the form `{{name}} <{{email}}>`                          |
| `subject` | _No default_  | `string` - Subject of the emails containing the TMS credentials for the users.                                                                    |
| `auth`    | _No default_  | `{ user: string; pass: string }` - Object containing the authentication data for the mail server. _Please note: For now, OAuth is not supported._ |

[config-doc]: ../setup/configuration
[nodemailer]: https://nodemailer.com/
