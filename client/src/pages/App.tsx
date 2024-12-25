import { CssBaseline, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavigationRail from '../components/navigation-rail/NavigationRail';
import { useLogin } from '../hooks/LoginService';
import AppBar from './AppBar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    '@global': {
      body: {
        overflowY: 'hidden',
        maxWidth: '100vw',
        maxHeight: '100vh',
        '& *': {
          ...theme.mixins.scrollbar(12),
        },
      },
    },
    root: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    contentWrapper: {
      display: 'flex',
      flex: '1 1 auto',
      overflowY: 'auto',
      ...theme.mixins.scrollbar(12),
    },
    content: {
      // Do NOT set the height on this class. If will break in Safari.
      display: 'flex',
      width: 0,
      flexGrow: 1,
      '& > *': {
        width: '100%',
        height: 'inherit',
        padding: theme.spacing(2, 2, 1, 2),
        position: 'relative',
      },
    },
  })
);

function App(): JSX.Element {
  const classes = useStyles();
  const { isLoggedIn } = useLogin();
  const [isDrawerOpen, setDrawerOpen] = useState(true);

  return (
    <>
      <CssBaseline />

      <div className={classes.root}>
        <AppBar onMenuButtonClicked={() => setDrawerOpen(!isDrawerOpen)} />

        <div className={classes.contentWrapper}>
          {isLoggedIn() && (
            <NavigationRail open={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
          )}

          <div className={classes.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
