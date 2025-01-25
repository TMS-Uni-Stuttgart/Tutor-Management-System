import {
  Button,
  ButtonGroup,
  IconButton,
  AppBar as MuiAppBar,
  PaletteMode,
  Popover,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {
  Brightness7 as DarkIcon,
  Download as DownloadIcon,
  Github as GitHubIcon,
  BookOpenPageVariant as HandbookIcon,
  Brightness5 as LightIcon,
  Menu as MenuIcon,
} from 'mdi-material-ui';
import { useSnackbar } from 'notistack';
import React, { useMemo, useState } from 'react';
import { useLocation, useMatches } from 'react-router';
import { useChangeTheme } from '../components/ContextWrapper';
import SubmitButton from '../components/loading/SubmitButton';
import { getSubItems } from '../components/navigation-rail/components/TutorialRailItem.helpers';
import { filterRoutes } from '../components/navigation-rail/NavigationRail.helper';
import { getTutorialXLSX } from '../hooks/fetching/Files';
import { getHandbookUrl } from '../hooks/fetching/Information';
import { useLogin } from '../hooks/LoginService';
import { useFetchState } from '../hooks/useFetchState';
import { LoggedInUser, TutorialInEntity } from '../model/LoggedInUser';
import { Tutorial } from '../model/Tutorial';
import { saveBlob } from '../util/helperFunctions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      backgroundColor: theme.palette.background.appBar,
      color: theme.palette.getContrastText(theme.palette.background.appBar),
      zIndex: theme.zIndex.drawer + 1,
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
    iconButton: {
      color: 'inherit',
      marginLeft: theme.spacing(0),
    },
    logoutButton: {
      marginRight: theme.spacing(2),
    },
    loggedInAsArea: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(1),
      textAlign: 'right',
    },
    popoverRoot: {
      margin: theme.spacing(1),
    },
  })
);

interface Props {
  onMenuButtonClicked: (ev: React.MouseEvent<HTMLButtonElement>) => void;
}

interface CreatingState {
  [tutorialSlot: string]: boolean | undefined;
}

function useAppBarTitle(userData: LoggedInUser | undefined): string {
  const location = useLocation();
  const matches = useMatches();

  const mainTitle = useMemo(() => {
    return (matches.at(-1)?.handle as any)?.title || '';
  }, [matches]);

  if (!userData) {
    return mainTitle;
  }

  const { tutorialRoutes } = filterRoutes(userData.roles);
  if (!tutorialRoutes || tutorialRoutes.length === 0) {
    return mainTitle;
  }

  const subItems = tutorialRoutes.flatMap((route) => getSubItems(route, userData));
  const matchingSubItem = subItems.find((item) => location.pathname.startsWith(item.subPath));
  const subrouteText = matchingSubItem ? ` - ${matchingSubItem.text}` : '';

  return `${mainTitle}${subrouteText}`;
}

function AppBar({ onMenuButtonClicked }: Props): JSX.Element {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const classes = useStyles();
  const theme = useTheme();
  const changeTheme = useChangeTheme();

  const { logout, isLoggedIn, userData } = useLogin();
  const userIsLoggedIn = isLoggedIn();

  const title = useAppBarTitle(userData);

  const [backupAnchor, setBackupAnchor] = useState<HTMLElement | undefined>(undefined);
  const [creatingXLSX, setCreatingXLSX] = useState<CreatingState>({});
  const [handbookUrl, , handbookUrlError] = useFetchState({
    fetchFunction: getHandbookUrl,
    immediate: true,
    params: [],
  });

  const handleThemeChange = () => {
    const newMode: PaletteMode = theme.palette.mode === 'light' ? 'dark' : 'light';
    changeTheme(newMode);
  };

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar('Erfolgreich ausgeloggt', { variant: 'success' });
  };

  const handleDownloadXLSX = async (tutorial: TutorialInEntity) => {
    const snackId = enqueueSnackbar('Erstelle XLSX...', { variant: 'info', persist: true });
    setCreatingXLSX((state) => ({ ...state, [tutorial.slot]: true }));

    try {
      const blob = await getTutorialXLSX(tutorial.id);
      saveBlob(blob, `Tutorium_${tutorial.slot}.xlsx`);
    } catch {
      enqueueSnackbar('XLSX konnte nicht erstellt werden.', { variant: 'error' });
    } finally {
      setCreatingXLSX((state) => ({ ...state, [tutorial.slot]: false }));
      closeSnackbar(snackId || undefined);
    }
  };

  return (
    <MuiAppBar position='static' className={classes.appBar}>
      <Toolbar>
        <IconButton
          className={classes.menuButton}
          color='inherit'
          onClick={onMenuButtonClicked}
          aria-label='Menu'
          style={{ visibility: userIsLoggedIn ? 'visible' : 'hidden' }}
          size='large'
        >
          <MenuIcon />
        </IconButton>

        <Typography variant='h6' color='inherit' className={classes.grow}>
          {title}
        </Typography>

        {userIsLoggedIn && (
          <>
            <Button
              color='inherit'
              variant='text'
              endIcon={<DownloadIcon />}
              onClick={(e) => setBackupAnchor(e.currentTarget)}
            >
              Backup
            </Button>

            <Popover
              open={!!backupAnchor}
              anchorEl={backupAnchor}
              onClose={() => setBackupAnchor(undefined)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              {userData && (
                <ButtonGroup
                  className={classes.popoverRoot}
                  orientation='vertical'
                  color='inherit'
                  variant='text'
                >
                  {[...userData.tutorials, ...userData.tutorialsToCorrect].map((tutorial) => (
                    <SubmitButton
                      key={tutorial.slot}
                      onClick={() => handleDownloadXLSX(tutorial)}
                      isSubmitting={!!creatingXLSX[tutorial.slot]}
                    >
                      {Tutorial.getDisplayString(tutorial)}
                    </SubmitButton>
                  ))}
                </ButtonGroup>
              )}
            </Popover>

            <div className={classes.loggedInAsArea}>
              <Typography variant='caption' color='inherit'>
                Angemeldet als:
              </Typography>

              <Typography variant='caption' color='inherit'>
                {userData ? `${userData.firstname} ${userData.lastname}` : 'NOT_FOUND'}
              </Typography>
            </div>

            <Button
              color='inherit'
              variant='text'
              onClick={handleLogout}
              className={classes.logoutButton}
            >
              Abmelden
            </Button>
          </>
        )}

        <Tooltip title='Zwischen hellem & dunklem Design wechseln.'>
          <IconButton
            onClick={handleThemeChange}
            className={classes.iconButton}
            size='large'
          >
            {theme.palette.mode === 'light' ? <LightIcon /> : <DarkIcon />}
          </IconButton>
        </Tooltip>

        {!handbookUrlError && !!handbookUrl && (
          <Tooltip title='Benutzerhandbuch'>
            <IconButton
              className={classes.iconButton}
              href={handbookUrl}
              target='_blank'
              rel='noopener noreferrer'
              size='large'
            >
              <HandbookIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title='GitHub Repository'>
          <IconButton
            className={classes.iconButton}
            href='https://github.com/Dudrie/Tutor-Management-System/issues'
            target='_blank'
            rel='noopener noreferrer'
            size='large'
          >
            <GitHubIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </MuiAppBar>
  );
}

export default AppBar;
