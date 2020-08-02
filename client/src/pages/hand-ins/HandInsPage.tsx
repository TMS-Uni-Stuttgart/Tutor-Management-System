import { Box, BoxProps, Paper, Tab, Tabs } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  FileCertificateOutline as ScheinExamIcon,
  FileClockOutline as ShortTestIcon,
  FileDocumentEditOutline as ExerciseSheetIcon,
} from 'mdi-material-ui';
import React, { useCallback, useMemo, useState } from 'react';
import TabPanel from '../../components/TabPanel';
import ScheinExamManagement from '../scheinexam-management/ScheinExamManagement';
import SheetManagement from '../sheetmanagement/SheetManagement';

const useStyles = makeStyles((theme) =>
  createStyles({
    tabBar: {
      margin: theme.spacing(-2, -2, 0, -2),
      padding: theme.spacing(0, 2),
    },
  })
);

function HandInsPage(): JSX.Element {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = useCallback((_, newValue: number) => {
    setSelectedTab(newValue);
  }, []);
  const panelProps: BoxProps = useMemo(() => ({ padding: 0, paddingTop: 2, height: '100%' }), []);

  return (
    <Box display='flex' flexDirection='column'>
      <Paper className={classes.tabBar} square>
        <Tabs value={selectedTab} onChange={handleChange}>
          <Tab icon={<ExerciseSheetIcon />} label='Übungsblätter' />
          <Tab icon={<ShortTestIcon />} label='Kurztests' />
          <Tab icon={<ScheinExamIcon />} label='Scheinklausuren' />
        </Tabs>
      </Paper>

      <Box flex={1}>
        <TabPanel value={selectedTab} index={0} {...panelProps}>
          <SheetManagement />
        </TabPanel>
        <TabPanel value={selectedTab} index={1} {...panelProps}>
          KURZTEST WORK_IN_PROGRESS
        </TabPanel>
        <TabPanel value={selectedTab} index={2} {...panelProps}>
          <ScheinExamManagement />
        </TabPanel>
      </Box>
    </Box>
  );
}

export default HandInsPage;
