import { Tab, Tabs } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { FormikErrors, useFormikContext } from 'formik';
import React, { useMemo, useState } from 'react';
import TabPanel from '../../../../components/TabPanel';
import { FormState } from '../../GenerateTutorials';
import IconForTab from './IconForTab';
import WeekdayBox from './WeekdayBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    errorTab: {
      color: theme.palette.error.main,
    },
  })
);

interface GetTabsForAllWeekdaysParams {
  errors: FormikErrors<FormState>;
  errorClass: string;
  selectedTab: number;
}

const weekdaysToShow: { [date: string]: string } = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
};

function getTabsForAllWeekdays({
  errors,
  errorClass,
  selectedTab,
}: GetTabsForAllWeekdaysParams): { tabs: JSX.Element[]; panels: JSX.Element[] } {
  const tabs: JSX.Element[] = [];
  const panels: JSX.Element[] = [];

  Object.entries(weekdaysToShow).forEach(([key, weekday], idx) => {
    const lowerKeyWeekday = key.toLowerCase();
    const showError = !!errors.weekdays?.[lowerKeyWeekday] || !!errors.prefixes?.[lowerKeyWeekday];

    tabs.push(
      <Tab
        key={lowerKeyWeekday}
        classes={{ wrapper: clsx(showError && errorClass) }}
        label={weekday}
        icon={<IconForTab weekday={lowerKeyWeekday} showError={showError} />}
      />
    );

    panels.push(
      <TabPanel key={`panel.${lowerKeyWeekday}`} index={idx} value={selectedTab}>
        <WeekdayBox
          name={`weekdays.${lowerKeyWeekday}`}
          prefixName={`prefixes.${lowerKeyWeekday}`}
        />
      </TabPanel>
    );
  });

  return { tabs, panels };
}

function WeekdayTabs(): JSX.Element {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const { errors } = useFormikContext<FormState>();

  const handleTabChange = (_: React.ChangeEvent<unknown>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const { tabs, panels } = useMemo(
    () =>
      getTabsForAllWeekdays({
        errors,
        selectedTab,
        errorClass: classes.errorTab,
      }),
    [errors, selectedTab, classes.errorTab]
  );

  return (
    <>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant='scrollable'
        scrollButtons='auto'
      >
        {tabs}
      </Tabs>

      {panels}
    </>
  );
}

export default WeekdayTabs;
