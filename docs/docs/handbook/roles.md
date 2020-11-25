---
id: roles
title: Roles
sidebar_label: Roles
---

import IconInText from '../../src/components/icon-in-text/IconInText';
import SubstituteIcon from './assets/icons/account-convert.svg';

## Description

The Tutor-Management-System comes with several roles a user can take. Each role allows the user specific actions and disallows others. A user can have more than one role. You can find a complete description of all roles and which pages they can access in this document. Please note that all roles have access to the [_Login_](./login) and [_Dashboard_](./dashboard) pages and therefore those are not mentioned in the lists of the roles.

## `ADMIN`

Is allowed to take any action and can manage the settings of the TMS. The admin is also responsible for creating users, tutorials and scheincriterias.

:::info Admin with tutorials
An admin itself can not be assigned to a tutorial. If an admin user should be assigned to a tutorial please assign the `TUTOR` role to that user aswell.

The same is true for admin users which also act as correctors for a tutorial (they need the `CORRECTOR` role).
:::

### Page Access

He/she has access to the following pages:

- [_User Management_](./user_management)
- [_Tutorial Management_](./tutorial_management)
  :::note
  An admin can access pages inside a tutorial (like the [_Sheet Gradings_](./sheet_gradings)) by clicking on "Manage" on a tutorial in the [_Tutorial Management_](./tutorial_management).
  :::
- [_Hand-Ins Management_](./hand_ins)
- [_Student Overview_](./student_overview)
- _Attendances_
- [_Scheincriteria Management_](./criterias)
- [_Settings_](./settings)

## `TUTOR`

Only `TUTOR` users can be assigned to tutorials as tutors. Furthermore, only this type of user can be used as substitutes for tutorials.

### Page Access

Tutors have access to the following pages. Pages marked with <IconInText icon={SubstituteIcon} /> are also accessible by a substiute tutor.

- [_Attendances_](./attendances) <IconInText icon={SubstituteIcon} small />
- [_Presentations_](./presentations) <IconInText icon={SubstituteIcon} small />
- [_Sheet Gradings_](./sheet_gradings)
- [_Scheinexams_](./scheinexam_gradings)
- [_Student Management_](./student_management)
- [_Team Management_](./team_management)
- [_Substitutes_](./substitutes)

## `CORRECTOR`

A `CORRECTOR` user can be assinged as a corrector of a tutorial (or multiple). The user has access to all pages related to assigning gradings to students.

### Page Access

- [_Sheet Gradings_](./sheet_gradings)
- [_Scheinexams_](./scheinexam_gradings)

## `EMPLOYEE`

An `EMPLOYEE` user can manage a few internal things. It is used if there are employees who help the organization but should not have administrative priviliges.

### Page Access

- [_Tutorial Management_](./tutorial_management)
  :::note
  An employee user can **not** access the internals of a tutorial (except managing the substitutes).
  :::
- [_Hand-Ins Management_](./hand_ins)
- _Attendances_
- [_Scheincriteria Management_](./criterias)
