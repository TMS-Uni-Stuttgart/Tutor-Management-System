---
id: student_overview
title: Student Overview (Admin)
sidebar_label: Student Overview
---

import Roles from '../../src/components/roles/Roles';
import IconInText from '../../src/components/icon-in-text/IconInText';
import MenuIcon from './assets/icons/dots-vertical.svg';
import ChangeTutorialIcon from './assets/icons/account-switch.svg';

<Roles roles={['admin']} />

## Overview

The overview page shows all students saved in the system and their current schein status. As an adminstrator you can edit or delete students by clicking on the menu button <IconInText icon={MenuIcon} /> and selecting the desired option. You can access the [_Student info page_](./student_info) by clicking on the "Information" button. Furthermore, you can search for a specific student by using the search bar at the top. For more information see the [_Student Management page_](./student_management).

## Change Tutorial

You can move a student from one tutorial to another by clicking on the menu button <IconInText icon={MenuIcon} /> and selecting the "<IconInText icon={ChangeTutorialIcon} /> Change Tutorial" option. A dialog opens up in which you can select the new tutorial.

:::important
While the student keeps it gradings (and while they will adjust if the old ones are changed) he/she loses the team. The tutor of the new tutorial has to assign him/her to a team.
:::

## Print List with Results

To print a list with the schein results click on the "Print Scheinlist" button. A PDF will be generated containing a table where each student will be displayed with a shortened/masked matriculation number and their result ("passed" / "not passed").

To print a list with completly readable matriculation number click on the small arrow on the right of the button and select "Print unshortened list". This list will still contain the shortened variants of the matriculation numbers but each also shows the unshortened number aswell.

:::caution Students without matriculation number
If a student does **not** have a matriculation number saved in the system he/she will **not** appear on any of the two lists. However, due to the shortening algorithm it could appear as he/she is on the list.
:::
