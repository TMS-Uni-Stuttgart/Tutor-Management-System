import { Box, BoxProps, Paper, Tab, Tabs } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  FileDocumentEditOutline as ExerciseSheetIcon,
  FileCertificateOutline as ScheinExamIcon,
  FileClockOutline as ShortTestIcon,
} from 'mdi-material-ui';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import TabPanel from '../../components/TabPanel';
import { ROUTES } from '../../routes/Routing.routes';
import ScheinExamManagement from './scheinexam-management/ScheinExamManagement';
import SheetManagement from './sheet-management/SheetManagement';
import ShortTestManagement from './short-test-management/ShortTestManagement';

const useStyles = makeStyles((theme) =>
  createStyles({
    tabBar: {
      margin: theme.spacing(-2, -2, 0, -2),
      padding: theme.spacing(0, 2),
    },
  })
);

interface Params {
  location?: string;
  [key: string]: string | undefined;
}

function HandInsPage(): JSX.Element {
  const { location } = useParams<Params>();
  const navigate = useNavigate();
  const classes = useStyles();

  const panelProps: BoxProps = useMemo(() => ({ padding: 0, paddingTop: 2, height: '100%' }), []);
  const selectedTab: number = useMemo(() => {
    if (!location) {
      return 0;
    }

    const idx = Number.parseInt(location);

    if (Number.isNaN(idx) || idx < 0 || idx >= 3) {
      return 0;
    }

    return idx;
  }, [location]);

  const handleChange = useCallback(
    (_, newValue: number) => {
      navigate(ROUTES.MANAGE_HAND_INS.create({ location: newValue.toString(10) }));
    },
    [navigate]
  );

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
          <ShortTestManagement />
        </TabPanel>
        <TabPanel value={selectedTab} index={2} {...panelProps}>
          <ScheinExamManagement />
        </TabPanel>
      </Box>
    </Box>
  );
}

export default HandInsPage;
