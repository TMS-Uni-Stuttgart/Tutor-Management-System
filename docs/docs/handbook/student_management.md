---
id: student_management
title: Student Management
sidebar_label: Student Management
---

import IconInText from '../../src/components/icon-in-text/IconInText';
import MenuIcon from './assets/icons/dots-vertical.svg';
import Roles from '../../src/components/roles/Roles';

<Roles roles={['tutor']} />

## Student Overview

The Student Overview page shows all students in your tutorial.
You can see which students are in which team and who would have achieved the "Schein" right now.
Furthermore, this is the page where you can create students and edit their information.
A click on the "Information" button on a student's bar leads to a page with more information about the selected student.

## Create Students

To create new students in your tutorial click the "+ New" button on the upper right. It opens up the following form:

![Form to create/edit students](./assets/student_form.png)

1.  **Firstname** (required): The firstname of the student.

1.  **Lastname** (required): The last name of the student.

1.  **Status** (required): The status of the student. There are three statuses available:

    - `ACTIVE`: The student is still activly participating in the course.
    - `INACTIVE`: The student is not participating anymore (ie has aborted the course).
    - `HAS SCHEIN`: The student is participating in the course but already has a valid Schein from an earlier term.

1.  **Team** (required): The team of the student.
    The TMS automatically selects the first team with a free slot (slot counts are configured by the admin). If no such team could be selected the _New team_ option gets selected.
    You can manually select one of three options:

    - _No team_: The student gets not assigned to any team.
    - _New team_: A new team is created and the student assigned to it.
    - _Team #XX_: The student gets assigned to the selected team.

1.  **Matriculation number** (semi-required): The matriculation number of the student. Gets used to map the results to the students later for the corresponding office at the university.

    :::caution
    If a student does not have a matriculation number assigned he/she can still earn points but their results will **not** be printed on the final overview sheet and can **not** be reported to the office.
    :::

1.  **Ilias name** (semi-required): The display name of the student for the ilias system. Used to map online test results to the students in the system.

    :::caution
    If a student does not have an ilias name assigned his/her test results will not be imported into the TMS. Those tests will count as **not passed** for the related students.
    :::

1.  **E-Mail** (optional): An e-mail adress of the student. Can be used for communication between the tutor and the student if one does not want to use the ilias mailing system.

1.  **Course of studies** (optional): The course of studies of the student. The value of this field is currently unused but will be used for statistical purposes in the future.

1.  **Save button**: Creates the new student. Afterwards the form gets resetted (but not closed) and a new student can be created.

1.  **Abort button**: Closes the form without saving the information.

## Edit Students

To edit a student click the menu button <IconInText icon={MenuIcon} /> on it's bar and choose "Edit". The form that opens up is the same one as for the process of creating a student ([see above](#create-students)).

## Delete Students

To delete a student click the menu button <IconInText icon={MenuIcon} /> on it's bar and choose "Delete". A confirmation dialog opens up if you really want to delete the student.

:::warning No restore possible
Deleting a student is **permanent**! Deleted students can **NOT** be restored.
:::
