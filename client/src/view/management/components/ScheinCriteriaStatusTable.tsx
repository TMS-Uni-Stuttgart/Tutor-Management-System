import {
  createStyles,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Theme,
  Tooltip,
} from '@material-ui/core';
import clsx from 'clsx';
import React, { useState } from 'react';
import { ScheinCriteriaStatus } from 'shared/model/ScheinCriteria';
import { useTranslation } from '../../../util/lang/configI18N';
import InfoTable from './InfoTable';
import StatusProgress from './StatusProgress';

interface Props {
  summary: ScheinCriteriaStatus[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      paddingBottom: theme.spacing(1.5),
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      boxShadow:
        'inset 0px 2px 3px -2px rgba(0,0,0,0.8), 0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)',
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
    placeholder: {
      marginTop: 64,
      textAlign: 'center',
    },
    progress: {
      maxWidth: '300px',
      minWidth: '200px',
      margin: theme.spacing(1),
    },
    statusInfosRowWithDetail: {
      '&:hover': {
        cursor: 'pointer',
        boxShadow: theme.shadows[4],
      },
    },
    statusInfosRowCell: {
      padding: theme.spacing(0.5),
      textAlign: 'center',
      '&:not(:last-child)': {
        borderRight: '1px solid black',
      },
      '&:last-child': {
        paddingRight: theme.spacing(0.5),
      },
    },
    bottomInfosRowCell: {
      borderTop: '1px solid black',
    },
  })
);

interface InfoContentProps {
  status: ScheinCriteriaStatus;
}

function InfosContent({ status }: InfoContentProps): JSX.Element | null {
  const classes = useStyles();
  const { t } = useTranslation('scheincriteria');

  const infos = Object.values(status.infos);

  if (infos.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableBody>
        <TableRow>
          {infos
            .sort((a, b) => a.no - b.no)
            .map((item, idx) => (
              <React.Fragment key={idx}>
                <TableCell className={classes.statusInfosRowCell}>{item.no}</TableCell>
              </React.Fragment>
            ))}
          <TableCell className={classes.statusInfosRowCell}>
            {t(`UNIT_LABEL_${status.unit}`)}
          </TableCell>
        </TableRow>
        <TableRow>
          {infos
            .sort((a, b) => a.no - b.no)
            .map((item, idx) => (
              <React.Fragment key={idx}>
                <TableCell className={clsx(classes.statusInfosRowCell, classes.bottomInfosRowCell)}>
                  {item.achieved} / {item.total}
                </TableCell>
              </React.Fragment>
            ))}
          <TableCell className={clsx(classes.statusInfosRowCell, classes.bottomInfosRowCell)}>
            {t(`UNIT_LABEL_${infos[0].unit}_plural`)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function ScheinCriteriaStatusTable({ summary }: Props): JSX.Element {
  const classes = useStyles();
  const { t } = useTranslation('scheincriteria');

  const [showDetailedInfos, setShowDetailedInfos] = useState(false);

  return (
    <Paper className={classes.root}>
      <InfoTable
        size='small'
        className={classes.infoRowTable}
        placeholder='Keine Kriterien vorhanden'
        items={Object.values(summary)}
        createRowFromItem={status => (
          <TableRow>
            {status.name.length > 0 ? (
              <TableCell>{status.name}</TableCell>
            ) : (
              <TableCell>{t(status.identifier)}</TableCell>
            )}
            <TableCell>
              <StatusProgress className={classes.progress} status={status} />
            </TableCell>
            {Object.values(status.infos).length > 0 && showDetailedInfos ? (
              <TableCell
                className={
                  Object.values(status.infos).length > 0 ? classes.statusInfosRowWithDetail : ''
                }
                onClick={() => {
                  setShowDetailedInfos(!showDetailedInfos);
                }}
              >
                <InfosContent status={status} />
              </TableCell>
            ) : Object.values(status.infos).length === 0 ? (
              <TableCell>
                {status.achieved + '/' + status.total + ' ' + t(`UNIT_LABEL_${status.unit}_plural`)}
              </TableCell>
            ) : (
              <Tooltip title='Mehr Details' placement='right'>
                <TableCell
                  className={
                    Object.values(status.infos).length > 0 ? classes.statusInfosRowWithDetail : ''
                  }
                  onClick={() => {
                    setShowDetailedInfos(!showDetailedInfos);
                  }}
                >
                  {`${status.achieved}/${status.total} ${t(`UNIT_LABEL_${status.unit}_plural`)}`}
                </TableCell>
              </Tooltip>
            )}
          </TableRow>
        )}
      />
    </Paper>
  );
}

export default ScheinCriteriaStatusTable;
