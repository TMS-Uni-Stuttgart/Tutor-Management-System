---
id: sheet_grading
title: Gradings for Sheets
sidebar_label: Sheet Gradings
---

import Roles from '../../src/components/roles/Roles';
import IconInText from '../../src/components/icon-in-text/IconInText';
import ArrowDownIcon from './assets/icons/menu-down.svg';
import MenuIcon from './assets/icons/dots-vertical.svg';

<Roles roles={['tutor', 'corrector']} />

## Overview

<!-- TODO: IMAGE -->

**[[IMAGE]]**

1. **Sheet Selection**: Select the sheet you want to display and/or edit the gradings of.

1. **Team Card**: Displays the information about the grading for the team. If the students have different gradings a special note is being displayed.

1. **Enter Points**: Click the button to enter points for the complete team. If you want to enter points for a single student of that team click the small arrow icon <IconInText icon={ArrowDownIcon} /> on the right and select "Single for students".

   :::note
   If students already have individual gradings for the selected sheet the "Single for students" option is pre-selected and cannot be changed.
   :::

1. **Card Menu**: To access more options for a team click on the menu icon <IconInText icon={MenuIcon} /> in the upper right of a card.

   1. `PDF Preview`: A dialog opens up which shows a preview of the content of the PDF(s). If students have different gradings the previews are seperated by name.

   1. `Dowload PDF(s)`: Download the PDF(s) which belong to the team. If multiple PDFs need to be generated (bc students have different gradings) they are bundled in a ZIP file.

1. **Create PDFs**: Create PDFs for all gradings of this sheet. PDFs are created for each team (if several students of that team have the same grading) and for each student with an individual grading. All created PDFs are bundled in a ZIP file.

   :::note
   The names of the PDF files are unified throughout the app. The administration can change the name of the files through their settings menu.
   :::

## Enter Points

Below you can find an explanation of the page for entering the points of a complete team or for an individual student.

<!-- TODO: IMAGE -->

**[[IMAGE]]**

1. **Select Exercise**: Select the exercise of the sheet you want to enter the grading for. You can change the selection without the need to save your changes.

1. **Select Team**: Select the team you want to enter the grading for.
   :::note
   If you change the team you have to save your changes. You will be prompted to do so.
   :::

1. **Points of Exercise**: Specify the points the students get for this exercise. If the exercise has subexercises you must enter the points for each subexercise.

1. **Comment for Exercise**: Enter a comment for the exercise. The comment fully supports GitHub flavored markdown.

1. **Preview**: Switch the textfield into "Preview" mode (or exit it if it is enabled) to view the rendered markdown.

1. **Reset**: Reset the form of the team _for the whole sheet_ to the last saved state.

1. **Save**: Save the changes made for the currently selected team.

1. **Back**: Go back to the overview page.
