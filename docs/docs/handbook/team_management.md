---
id: team_management
title: Team Management
sidebar_label: Team Management
---

import Roles from '../../src/components/roles/Roles';
import MenuIcon from './assets/icons/dots-vertical.svg';

<Roles roles={['tutor']} />

## Create a Team

To create a team click on the "+ New" button in the upper right. A form opens up which lets you select students which should form a team. You can only select students that do _not_ already have a team.

:::note Empty teams
You can create empty teams by not selecting any student in the list and clicking on the "Save" button.
:::

## Change Team of Student

If you want to move a student from one team to another you have to remove him/her from the old team first. Afterwards you can add the student to the other team.

:::tip Better way
A better and easier way to achieve this would be to just edit the student via the [_Student Management page_](./student_management) and adjust his/her team.
:::

## Edit & Delete a Team

To edit or delete a team click on the menu icon <IconInText icon={MenuIcon} /> on the right of a team. Select either the "Edit" or the "Delete" option. By selecting "Edit" a dialog opens up with the same form as the one used to create a team. By selecting "Delete" you will be prompted if you really want to delete the team.

:::caution
Deleting a team with students will leave the students without a team. Remember to assign them to new teams if necessary.
:::
