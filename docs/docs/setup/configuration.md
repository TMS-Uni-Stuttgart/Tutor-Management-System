---
id: configuration
title: Configuration
sidebar_label: Configuration
---

## Structure of Directory

Within the `tms/config/` directory containing the configuration files the following items have to be present:

- `production.yml`: YAML file containing the general configuration for the server.
- `templates/`: Directory containing the [Pug](https://pugjs.org/) template files (see below).

Those files are provided through a docker volume. See the [installation guide](installation) for more information.

Every [release][releases] contains either a link to the current sample configuration or a sample configuration itself. If it contains the later the server configuration might need an update according to the _Configuration_ section of the release.

## Options

The configuration object is of type `ApplicationConfiguration`.

### `ApplicationConfiguration`

| Option            | Required / Default                         | Description                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `database`        | **Required**                               | `DatabaseConfiguration` - Configuration of the database. See below for more information.                                                                                                                                                                               |
| `sessionTimeout`  | _Default: 120_                             | `Number` - The time of inactivity in **minutes** after which the session of the user times out and he/she must log in again.                                                                                                                                           |
| `prefix`          | _(optional, no default)_                   | `String` - Prefix of the root path the application is hosted on. If the application is hosted on the root path this setting must be omitted. Otherwise it has to be set to the prefix (ie. for the path `https://example.org/foo` this setting has to be set to `foo`) |
| `handbookUrl`     | _(optional, no default)_                   | `String` - URL to the handbook of the TMS (the sample configuration sets this to the URL of this handbook). You should only have to change this if you want to provide your own version of the handbook.                                                               |
| `defaultSettings` | _(optional, defaults see "Settings" page)_ | Settings to initialize parts of the server with. Those settings can also be configured through the client later on. See [Settings](../handbook/settings) for more information.                                                                                         |

### `DatabaseConfiguration`

The following table contains the options available for the database configuration, a short description and their default value (if they are optional).

| Option        | Required / Default                                             | Description                                                                                                                                                                                                                                                                                                                       |
| ------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `databaseURL` | **Required**                                                   | `String` - The URL which resolves to the database and the desired collection. Must be a MongoDB URL. _Please note: Databases other than MongoDB might work if they are compatible to mongoose. However they are not tested and officially supported._                                                                             |
| `maxRetries`  | _Default: 2_                                                   | `Number` - Configures how often the server tries to establish a connection to the database while **starting** the server. If there is no connection after the maximum amount of retries the server is stopped with an error code. _Please note: Any try to connect can take up to 30s._                                           |
| `config`      | _Default: `{useNewUrlParser: true, useUnifiedTopology: true}`_ | `ConnectionOptions` - The `auth` property will not be respected. To set authentication details one must use the corresponding [environment variables](#environment-variables) Further configuration options provided to the MongoDB connection. For more information see the [mongoose documentation][mongoose-createconnection]. |

## Environment Variables

All of the following environment variables are **required** unless stated otherwise.

| Variable           | Description                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TMS_MONGODB_USER` | `String` - Username to log into the mongoDB.                                                                                                                                             |
| `TMS_MONGODB_PW`   | `String` - Password to log into the mongoDB.                                                                                                                                             |
| `TMS_SECRET`       | `String` - Secret to encrypt sensitive fields in the documents in the DB (ie names of users, ...). This secret should be created like a _secure password_ (no easy to guess words, ...). |

## Pug Templates

The Tutor-Management-System can generate various PDFs. These can be configured using the following templates. The templates must be inside an `templates/` folder inside the `config/` folder. All templates use the [pug template engine][pug] and variables which will get substituted by the corresponding value on PDF generation. Every template section contains a description on it's usage, the variables used inside and an example. Please note that the templates do NOT need a `html`, `body` or `head` because they will be inserted into a body during PDF generation.

:::caution
Please note that **all template files** must be present at the start of the server.
:::

### Attendance Template

**Filename: `attendance.pug`**

This template gets used on the creation of a PDF containing a list of students of a tutorial. On this list students can leave their signature if they are present.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
defaultValue="desc"
values={[
{ label: 'Description', value: 'desc', },
{ label: 'Example', value: 'example', },
]
}>
<TabItem value="desc">

| Variable       | Description                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tutorialSlot` | `String` - The slot of the tutorial which belongs to the sheet.                                                                                                                          |
| `date`         | `DateTime` - Date to which the attendance list belongs. Takes in the format after a comma. For more information on the available functions see the [luxon documentation][luxon-datetime] |
| `tutorName`    | `String` - Name of the tutor in the format `<lastname>, <firstname>`.                                                                                                                    |
| `students`     | `{ name: string }[]` - Array containing objects of which each holds the name of one student.                                                                                             |

</TabItem>
<TabItem value="example">

```pug
h3(style='text-align: center') Anwesenheitsliste

div(style='display: flex; width: 100%')
    span Tutorium #{tutorialSlot}
    span(style='margin-left: auto; float: right') Datum: #{date.toFormat('dd.MM.yyyy')}

div(style='margin-bottom: 16px')
    span Tutor: #{tutorName}

table
    thead
        tr
            th Name
            th Unterschrift

    tbody
        each student in students
            tr
                td #{student.name}
                td
```

</TabItem>
</Tabs>

### Credentials Template

**Filename: `credentials.pug`**

<Tabs
defaultValue="desc"
values={[
{ label: 'Description', value: 'desc', },
{ label: 'Example', value: 'example', },
]
}>
<TabItem value="desc">

| Variable      | Description                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `credentials` | `{ name: string; username: string; password: string }[]` - Array containing objects which hold information about the user. |

</TabItem>
<TabItem value="example">

```pug
h3(style='text-align: center') Zugangsdaten

table
  style(scoped).
    td {
      padding: 0.5em 1em;
      font-family: "Courier New", Courier, monospace;
      line-height: 200%;
    }

  thead
    tr
      th Name
      th Nutzername
      th Password

  tbody
    each user in users
      tr
        td #{user.name}
        td #{user.username}
        if !!user.password
          td #{user.password}
        else
          td Kein tmp. Passwort
```

</TabItem>
</Tabs>

### Mail Template

**Filename: `mail.pug`**

<Tabs
defaultValue="desc"
values={[
{ label: 'Description', value: 'desc', },
{ label: 'Example', value: 'example', },
]
}>
<TabItem value="desc">

| Variable   | Description                                           |
| ---------- | ----------------------------------------------------- |
| `name`     | `String` - Name of the user which gets the email.     |
| `username` | `String` - Username of the user which gets the email. |
| `password` | `String` - Password of the user which gets the email. |

</TabItem>
<TabItem value="example">

```pug
| Hallo #{name},
|
| hier sind deine Zugangsdaten zum Tutor-Management-System:
|
| Nutzername: #{username}
| Passwort: #{password}
|
| Mit freundlichen Grüßen
| TMS Admin
```

</TabItem>
</Tabs>

### Scheinexam Results Template

**Filename: `scheinexam.pug`**

<Tabs
defaultValue="desc"
values={[
{ label: 'Description', value: 'desc', },
{ label: 'Example', value: 'example', },
]
}>
<TabItem value="desc">

| Variable       | Description                                                                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheinExamNo` | `Number` - Number of the Scheinexam of this PDF.                                                                                                                                                                                                          |
| `statuses`     | `{ matriculationNo: string; state: PassedState }[]` - Array containing the statuses of each student (with matriculation number) for the exam of the generated PDF. `PassedState` can be one of the following values: "passed", "notPassed", "notAttended" |

</TabItem>
<TabItem value="example">

```pug
h3(style='text-align: center') Scheinklausur Nr. #{scheinExamNo}

table
  style(scoped).
    td {
      padding: 0.5em 1em;
      font-family: "Courier New", Courier, monospace;
      line-height: 200%;
    }

  thead
    tr
      th Matrikelnummer
      th Bestanden / Nicht bestanden

  tbody
    each status in statuses
      tr
        td #{status.matriculationNo}
        if status.state === "passed"
          td Bestanden
        else if status.state === "notPassed"
          td Nicht bestanden
        else
          td Abwesend
```

</TabItem>
</Tabs>

### Scheinstatus Results Template

**Filename: `scheinstatus.pug`**

<Tabs
defaultValue="desc"
values={[
{ label: 'Description', value: 'desc', },
{ label: 'Example', value: 'example', },
]
}>
<TabItem value="desc">

| Variable   | Description                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `statuses` | `{ matriculationNo: string; state: PassedState }[]` - Array containing the Schein statuses of each student (with matriculation number). PassedState can be one of the following values: "passed", "notPassed" |

</TabItem>
<TabItem value="example">

```pug
h3(style='text-align: center') Scheinliste

table
  style(scoped).
    td {
      padding: 0.5em 1em;
      font-family: "Courier New", Courier, monospace;
      line-height: 200%;
    }

  thead
    tr
      th Matrikelnummer
      th Bestanden / Nicht bestanden

  tbody
    each status in statuses
      tr
        td #{status.matriculationNo}
        if status.state === "passed"
          td Bestanden
        else
          td Nicht bestanden
```

</TabItem>
</Tabs>

[releases]: https://github.com/Dudrie/Tutor-Management-System/releases
[mongoose-createconnection]: https://mongoosejs.com/docs/connections.html
[ethereal]: https://ethereal.email/
[nodemailer-config]: https://nodemailer.com/smtp/
[nodemailer-authentication]: https://nodemailer.com/smtp/#authentication
[luxon-datetime]: https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html
[pug]: https://pugjs.org/api/getting-started.html
