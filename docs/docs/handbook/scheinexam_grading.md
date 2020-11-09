---
id: scheinexam_gradings
title: Gradings for Scheinexams
sidebar_label: Scheinexam Gradings
---

import Roles from '../../src/components/roles/Roles';
import IconInText from '../../src/components/icon-in-text/IconInText';

<Roles roles={['tutor', 'corrector']} />

## Overview

After selecting a scheinexam from the dropdown menu you can see the gradings the students have for the selected exam. To add a grading to or change the grading of a student click the "Enter Points" button on his/her card.

<!-- TODO: Image -->

**[[IMAGE]]**

1. **Scheinexam Selection**: Select the scheinexam you want to view.

1. **Student's Grading**: The current grading of a student.
   :::note
   If a student has no grading all exercises are displayed with 0 points.
   :::

1. **Enter Points**: Enter points for the selected scheinexam and student (see [_below_](#enter-points)).

## Enter Points

<!-- TODO: Image -->

**[[IMAGE]]**

1. **Student Selection**: Select the student you want to change the grading of.

   :::note Unsaved changes
   If you have unsaved changes you are prompted to save them before switching. If do **not** the changes are lost.
   :::

1. **Points for exercises**: Enter the points the student got for each exercise. Please note that exercises are always "bundled" together and that no sub-exercises are shown.

1. **Save**: Save the changes for the currently selected student.

1. **Reset**: Reset your changes for the student to the last saved ones.

1. **Go back**: Go back to the overview page.
