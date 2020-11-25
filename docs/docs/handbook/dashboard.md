---
id: dashboard
title: Dashboard
sidebar_label: Dashboard
---

import Roles from '../../src/components/roles/Roles';

<Roles roles={['all']} />

## As `TUTOR`

If you are assigned to one or more tutorials your dashboard contains the following items per tutorial:

- **Information about tutorial**: These information are number of participants, number of teams, time slot and weekday.

- **Current schein status**: A pie chart which shows how many students would have passed and not passed the schein at the current moment.

- **Data about criterias**: Different graphs for the criterias. The graph vary between the different criterias.

## As `ADMIN`

As administrator you can view an overview of the schein statuses for all tutorials by clicking the "Load Tutorial Overview" button at the top. The column chart shows one column per tutorial. Each column is divided into two sections: The percentage of students who would have passed the schein at the current moment and the ones who would not have passed it.

:::caution Loading time
Due to the calculations needed to gather the schein statuses of all students the graph can take more than a few seconds to load.
:::
