---
id: hand_ins
title: Hand-Ins
sidebar_label: Hand-Ins
---

import Roles from '../../src/components/roles/Roles';
import IconInText from '../../src/components/icon-in-text/IconInText';
import MenuIcon from './assets/icons/dots-vertical.svg';

<Roles roles={['admin', 'employee']} />

## Create a Hand-In

To add a new hand-in click the "+ New" button in the upper right. Each hand-in has a slightly different form (see below in the [hand-in types](#hand-in-types)). However, all three hand-in forms use the same form for their exercises.

![Exercise Form](./assets/exercise_form.png)

1. **Add Exercise**: Add a new exercise to the sheet.

1. **Exercise Name**: Name of the exercise on the hand-in.

   :::note
   Will be automatically set on each new exercise but can be changed.
   :::

1. **Total Points**: The total points of the exercise.

   :::note
   This is only needed and editable if the exercise does **not** have any subexercises.
   :::

1. **Bonus Exercise**: Mark this exercise as bonus exercise. While students can gain points in bonus exercises the total points of a bonus exercise are **not** added to the total points of the sheet.

1. **Remove Exercise**: Remove the exercise from the sheet.

   :::caution
   There will be **no** confirmation prompt.
   :::

1. **Add Subexercise**: Add a new subexercise to this exercise.

1. **Subexercise Name**: Name of the subexercise.

1. **Subexercise Points**: The total points of the subexercise.

1. **Bonus Subexercise**: Mark this subexercise as a bonus. The total points of the subexercise will **not** be added to the total points of the exercise if it's a bonus subexercise.

1. **Remove Subexercise**: Remove the subexercise from the exercise.

1. **Save**: Save the hand-in.

## Hand-In Types

### Exercise Sheet

An exercise sheet is used for the _Sheet_ criterias and has the following two form inputs:

1. **Sheet Number**: The number of the sheet.

   :::note
   On opening the creation form this number is automatically set but can be changed.
   :::

1. **Bonus Sheet**: Mark the sheet as bonus. While students can pass it (or gain points on it) it is not added to the number of sheets a student has to pass (or to the total number of points available).

### Short Test

:::tip
If you import the results of a new short test (see [Import Short Tests Results](#import-short-test-results) below) a new short test is automatically created during the import process.
:::

A short test is used for the _Short Test_ criteria and has the following two inputs:

1. **Short Test Number**: The number of the short test.

   :::note
   On opening the creation form this number is automatically set but can be changed.
   :::

1. **Percentag to pass**: The percentage of the points needed to pass the test.

#### Additional menu option

If you click on the menu button <IconInText icon={MenuIcon} /> you can select the additional option "re-import results". This lets you re-import already imported results (ie if the results where inaccurate at the first time) without re-creating the short test.

### Scheinexam

A scheinexam is used for the _scheinexam_ criteria and has the following three inputs:

1. **Scheinexam Number**: The number of the scheinexam.

   :::note
   On opening the creation form this number is automatically set but can be changed.
   :::

1. **Percentag to pass**: The percentage of the points needed to pass the scheinexam.

1. **Date**: The date of the scheinexam. This is only used to display additional information on the PDF containing the results.

#### Additional menu option

If you click on the menu button <IconInText icon={MenuIcon} /> you can select the additional option "results". This will create a PDF containing the results of the students for the scheinexam. By default the PDF contains a table with the masked matriculation numbers of the students and their result ("passed" / "not passed").

## Change a Hand-In

To edit a hand-in click the menu button <IconInText icon={MenuIcon} /> on it's bar and choose "Edit". The form that opens up is the same one as for the process of creating a hand-in ([see above](#create-a-hand-in)).

## Delete a Hand-In

To delete a hand-in click the menu button <IconInText icon={MenuIcon} /> on it's bar and choose "Delete". A confirmation dialog opens up if you really want to delete the hand-in.

:::warning No restore possible
Deleting a hand-in is **permanent**! Deleted hand-ins can **NOT** be restored and gradings related to it are **lost**!
:::

## Import Short Test Results

To import short test results from the Ilias system you can use the import wizard by clicking on the "Import new results" button in the upper right on the short test page. Follow the step-by-step wizard which opens up.

1. **Export results from Ilias**: Follow the on-screen instruction to export the correct CSV file from the Ilias system

   :::note
   Make sure to export the correct CSV file. There is only one file that contains the results and the Ilias names.
   :::

1. **Import CSV content**: Import the CSV content by either copy & paste the content in the input field or by uploading the file. You can upload the file by clicking the "Upload CSV-file" button and the content will be pasted into the input field after uploading. If the separator is not correctly detected on the next page you can change the seperator on _this_ page using the "Separator" input in the upper right.

   :::tip Drag & Drop
   You can also drag & drop the file on the button
   :::

1. **Map Columns**: The TMS tries to find the three needed columns automatically. It needs the Ilias name and the test results of the students together with the total results. If the columns are not properly detected you can change them through the dropdown menus on this page.

1. **Map Ilias names**: If the CSV file contains any Ilias names which could not be find in the TMS system you can manually map those names to students (these mappings will only be used for this import process). The page also shows a list of all students in the TMS system which could not be found in the imported CSV (either because they do not have an Ilias name saved in the TMS or their Ilias name was not present in the CSV file).

1. **Adjust Short Test**: If necessary you can adjust the short test that would be generated during the import process. By default the number gets automatically increased and it only contains one exercise which holds the total points of the test.
