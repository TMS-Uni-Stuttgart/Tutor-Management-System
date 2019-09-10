import {
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TableRowProps } from '@material-ui/core/TableRow';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Person as PersonIcon,
} from '@material-ui/icons';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Team } from 'shared/dist/model/Team';
import ListItemMenu from '../../../components/ListItemMenu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      '&:hover': {
        background: 'rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      },
      '& td': {
        // This prevents table-cells from getting too small if other cells take up more space.
        whiteSpace: 'nowrap',
        '&:nth-last-of-type(2)': {
          width: '100%',
        },
      },
    },
    avatar: {
      marginLeft: theme.spacing(2),
    },
    infoBlock: {
      display: 'grid',
      gridRowGap: theme.spacing(1),
      gridColumnGap: theme.spacing(2),
      gridTemplateColumns: 'max-content 1fr',
    },
    noBottomBorder: {
      '& > td': {
        borderBottom: 'none',
      },
    },
    showInfoIcon: {
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      transform: 'rotate(0deg)',
    },
    showInfoIconOpened: {
      transform: 'rotate(-180deg)',
    },
    infoRowCell: {
      paddingTop: theme.spacing(0.5),
    },
    infoRowContent: {
      maxWidth: '95%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    infoRowTable: {
      width: 'unset',
    },
  })
);

interface Props extends TableRowProps {
  team: Team;
}

function ExtendableTeamRow({ team, className, onClick, ...rest }: Props): JSX.Element {
  const classes = useStyles();

  const [showInfoBox, setShowInfoBox] = useState(false);
  const teamNr = team ? team.teamNo : '';

  return (
    <>
      <TableRow
        {...rest}
        className={clsx(classes.content, className, showInfoBox && classes.noBottomBorder)}
        onClick={e => {
          setShowInfoBox(!showInfoBox);

          if (onClick) {
            onClick(e);
          }
        }}
      >
        <TableCell padding='checkbox'>
          <Avatar className={classes.avatar}>
            <PersonIcon />
          </Avatar>
        </TableCell>

        <TableCell>
          <Typography component='div'>{`${teamNr}`}</Typography>
          <Typography
            component='div'
            variant='body2'
            color='textSecondary'
          >{`Teamnummer: ${teamNr}`}</Typography>
        </TableCell>

        <TableCell>
          <Typography
            component='div'
            variant='body2'
            color='textSecondary'
          >{`Tutorium: <NR>`}</Typography>
          <Typography
            component='div'
            variant='body2'
            color='textSecondary'
          >{`Teamnummer: TEST`}</Typography>
        </TableCell>

        <TableCell align='right'>
          <IconButton
            className={clsx(classes.showInfoIcon, showInfoBox && classes.showInfoIconOpened)}
            onClick={e => {
              e.stopPropagation();
              setShowInfoBox(!showInfoBox);
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>

          {/* TODO: Fill me with listeners */}
          <ListItemMenu />
        </TableCell>
      </TableRow>

      {showInfoBox && (
        <TableRow>
          <TableCell className={classes.infoRowCell} align='center' colSpan={4}>
            <div className={classes.infoRowContent}>
              <Table size='small' className={classes.infoRowTable}>
                <TableBody>
                  <TableRow>
                    <TableCell>Bestanden:</TableCell>
                    <TableCell>ANZAHL</TableCell>

                    <TableCell>Gesamt:</TableCell>
                    <TableCell>ANZAHL</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Prozent:</TableCell>
                    <TableCell>PROZENT</TableCell>
                    <TableCell>Anwesenheit:</TableCell>
                    <TableCell>ANWESEND / GESAMT</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default ExtendableTeamRow;
