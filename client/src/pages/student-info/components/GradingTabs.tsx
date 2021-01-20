import { Tab, Tabs } from '@material-ui/core';
import React, { useState } from 'react';
import TabPanel from '../../../components/TabPanel';
import { Scheinexam } from '../../../model/Scheinexam';
import { Sheet } from '../../../model/Sheet';
import { ShortTest } from '../../../model/ShortTest';
import { Student } from '../../../model/Student';
import { Tutorial } from '../../../model/Tutorial';
import AttendanceInformation, { AttendanceInformationProps } from './AttendanceInformation';
import GradingInformation from './GradingInformation';

interface Props {
  student: Student;
  sheets: Sheet[];
  tutorialOfStudent: Tutorial;
  shortTests: ShortTest[];
  exams: Scheinexam[];
  onAttendanceChange: AttendanceInformationProps['onAttendanceChange'];
  onNoteChange: AttendanceInformationProps['onNoteChange'];
}

function GradingTabs({
  student,
  tutorialOfStudent,
  sheets,
  shortTests,
  exams,
  onAttendanceChange,
  onNoteChange,
}: Props): JSX.Element {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_: React.ChangeEvent<unknown>, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label='Übungsblätter' />
        <Tab label='Anwesenheiten' />
        <Tab label='Kurztests' />
        <Tab label='Scheinklausuren' />
      </Tabs>

      <TabPanel value={selectedTab} index={0}>
        <GradingInformation
          student={student}
          entities={sheets}
          selectLabel='Übungsblatt'
          selectEmptyPlaceholder='Keine Übungsblätter vorhanden'
          selectNameOfNoneItem='Kein Übungsblatt'
          noneSelectedPlaceholder='Kein Übungsblatt ausgewählt'
          marginBottom={1}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {tutorialOfStudent && (
          <AttendanceInformation
            student={student}
            tutorialOfStudent={tutorialOfStudent}
            onAttendanceChange={onAttendanceChange}
            onNoteChange={onNoteChange}
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <GradingInformation
          student={student}
          entities={shortTests}
          disableCommentDisplay
          selectLabel='Kurztest'
          selectEmptyPlaceholder='Keine Kurztests vorhanden'
          selectNameOfNoneItem='Kein Kurztest'
          noneSelectedPlaceholder='Kein Kurztest ausgewählt'
          marginBottom={1}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        <GradingInformation
          student={student}
          entities={exams}
          disableCommentDisplay
          selectLabel='Scheinklausur'
          selectEmptyPlaceholder='Keine Scheinklausuren vorhanden'
          selectNameOfNoneItem='Keine Scheinklausur'
          noneSelectedPlaceholder='Keine Scheinklausur ausgewählt'
          marginBottom={1}
        />
      </TabPanel>
    </>
  );
}

export default GradingTabs;
