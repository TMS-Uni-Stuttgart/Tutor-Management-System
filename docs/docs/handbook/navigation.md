---
id: navigation
title: Navigate inside the App
sidebar_label: Navigation
---

import IconInText from '../../src/components/icon-in-text/IconInText';
import TutorialIcon from './assets/icons/teach.svg';
import SubstituteIcon from './assets/icons/account-convert.svg';
import CorrectorIcon from './assets/icons/checkbox-marked-circle-outline.svg';

import nrDashboard from './assets/navigation_rail/dashboard.png';
import nrTutorial from './assets/navigation_rail/tutorial.png';
import nrManagement from './assets/navigation_rail/management.png';

## AppBar (Top)

At the top of the app you can find an AppBar which has the items described below. Please note that some items are only available if you are logged in.

![AppBar](./assets/appbar.png)

_From left to right_:

1. **Menu Button**: A button which lets you minimize / open the navigation rail. If minimized the navigation rail only displays the icons without text.

1. **Current Page**: The title of the current page.

1. **Backup**: Create a backup XLSX file for your tutorial(s). The list will be empty for users without any tutorial.

   :::caution
   The backup is humanly readable and **not** encrypted! Only save it if absolutly necessary and store it at a safe location.
   :::

1. **Logged in User**: The name of the currently logged in user (this should be you).

1. **Log out Button**: You can log out by clicking this button. Afterwards you will be redirected to the [_Login page_](./login).

1. **Switch Theme**: Switch the theme of the app between a light and a dark theme.

   :::note
   By default the app uses your preferences configured in your browser.
   :::

1. **Handbook**: Opens this handbook in a new tab of your browser.

1. **GitHub**: Opens the GitHub repository in a new tab of your browser.

## Navigation Rail (left)

:::note
The navigation rail is only visible to logged in users.
:::

As a user you can find different items in the navigation rail. You can find a description for each section of the navigation rail below. The currently selected page is highlighted in <span class="navigation-rail-highlight">light blue</span>. Below of the navigation rail you find the current version of the TMS. By clicking on it a new tab with the release notes of the version will be opened in your browser.

<img src={nrDashboard} class="float-image-left" />

At the top you find the link to the Dashboard page. This is visible to all users.

<div class="float-break" />

<img src={nrTutorial} class="float-image-left" />

Next, you can find the block containing all tutorial related items. This block is only visible if you have one or more tutorials. The exact items also change if you are only a corrector (or if you are only a substitute without own tutorials). You can find a description of all items in the "Tutorial" and "Gradings" sections.

If you only have access to one tutorial you can navigate to the pages by just clicking on the corresponding item in the rail. If you have access to multiple tutorials a sub menu opens up if you hover an item. All sub items marked with <IconInText icon={TutorialIcon} /> are related to your own tutorials, items marked with <IconInText icon={SubstituteIcon} /> are tutorials you are a substitute of and items marked with <IconInText icon={CorrectorIcon} /> are tutorials you are a corrector of.

<div class="float-break padding-top-bottom" />

<img src={nrManagement} class="float-image-left" />

Last, you can find the block related to managing the course. This section is only available to adminstrators and employee users. You can find a description of the different pages inside the "Internal" section on the left.
