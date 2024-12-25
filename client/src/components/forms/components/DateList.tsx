import { ListItemIcon, Typography } from '@mui/material';
import List, { ListProps } from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import {
  CalendarAlert as PlaceholderIcon,
  CalendarRemoveOutline as RemoveIcon,
} from 'mdi-material-ui';
import { useEffect, useRef, useState } from 'react';
import { compareDateTimes } from '../../../util/helperFunctions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
    },
    icon: {
      color: 'inherit',
      minWidth: 32,
    },
    emptyListPlaceholder: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -8, // Adjust visuals to look centered.
      padding: theme.spacing(3.6),
    },
  })
);

export interface DateInList {
  dateValueString: string;
  dateDisplayString: string;
}

interface Props extends ListProps {
  dates: DateInList[];
  onDateClicked: (date: string) => void;
}

function DateList({ dates, className, onDateClicked, ...other }: Props): JSX.Element {
  const classes = useStyles();
  const [labelWidth, setLabelWidth] = useState(0);
  const placeholder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (placeholder.current) {
      setLabelWidth(placeholder.current.offsetWidth);
    }
  }, [setLabelWidth]);

  return (
    <>
      {dates.length > 0 ? (
        <List {...other} className={clsx(classes.root, className)} style={{ minWidth: labelWidth }}>
          {dates
            .sort((a, b) =>
              compareDateTimes(
                DateTime.fromISO(a.dateValueString),
                DateTime.fromISO(b.dateValueString)
              )
            )
            .map((date) => (
              <ListItem
                key={date.dateValueString}
                onClick={() => onDateClicked(date.dateValueString)}
                dense
                button
              >
                <ListItemIcon className={classes.icon}>
                  <RemoveIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText primary={date.dateDisplayString} />
              </ListItem>
            ))}
        </List>
      ) : (
        <div ref={placeholder} className={classes.emptyListPlaceholder}>
          <PlaceholderIcon />
          <Typography variant='body2'>Keine Termine</Typography>
        </div>
      )}
    </>
  );
}

export default DateList;
