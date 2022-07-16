import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Formik } from 'formik';
import {
  NoteText as NoteTextIcon,
  Pencil as EditIcon,
  PlusCircle as AddIcon,
} from 'mdi-material-ui';
import React, { useRef, useState } from 'react';
import { FormikSubmitCallback } from '../../../types';
import FormikTextField from '../../forms/components/FormikTextField';
import SubmitButton from '../../loading/SubmitButton';

const useStyles = makeStyles((theme) =>
  createStyles({
    popperPaper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      padding: theme.spacing(2),
      minWidth: 256 * 1.5,
      maxWidth: 450,
    },
    popperText: {
      width: '100%',
    },
    noNoteAvailableText: {
      fontStyle: 'italic',
      textAlign: 'center',
    },
    popperForm: {
      width: '100%',
      height: '100%',
    },
    popperButton: {
      marginRight: theme.spacing(1),
    },
  })
);

interface AttendanceNotePopperProps {
  note?: string;
  onNoteSave: NoteFormCallback;
}

interface NoteFormState {
  note: string;
}

export type NoteFormCallback = FormikSubmitCallback<NoteFormState>;

function AttendanceNotePopper({ note, onNoteSave }: AttendanceNotePopperProps): JSX.Element {
  const classes = useStyles();

  const iconButtonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [isEditMode, setEditMode] = useState(false);

  const initialNoteFormState: NoteFormState = {
    note: note ?? '',
  };

  const handlePopperOpen = () => {
    setOpen((o) => !o);

    if (!note) {
      setEditMode(true);
    }
  };

  const handlePopperClose = () => {
    if (open) {
      setOpen(false);
    }
  };

  const handleCancelEdit = () => {
    if (!note) {
      setOpen(false);
    } else {
      setEditMode(false);
    }
  };

  const handleSaveNote: FormikSubmitCallback<NoteFormState> = async (values, actions) => {
    await onNoteSave(values, actions);

    setEditMode(false);
  };

  return (
    <ClickAwayListener onClickAway={handlePopperClose}>
      <div>
        <Tooltip title={!!note ? 'Bemerkung ansehen & bearbeiten' : 'Bemerkung hinzufügen'}>
          <IconButton ref={iconButtonRef} onClick={handlePopperOpen}>
            {!!note ? <NoteTextIcon /> : <AddIcon />}
          </IconButton>
        </Tooltip>

        <Popper open={open} anchorEl={iconButtonRef.current} placement='bottom-end'>
          <Paper elevation={16} className={classes.popperPaper}>
            <Formik initialValues={initialNoteFormState} onSubmit={handleSaveNote}>
              {({ handleSubmit, isSubmitting, isValid }) => (
                <form onSubmit={handleSubmit} className={classes.popperForm}>
                  {isEditMode ? (
                    <FormikTextField name='note' label='Anmerkung' fullWidth autoFocus />
                  ) : (
                    <Typography
                      className={clsx(classes.popperText, !note && classes.noNoteAvailableText)}
                    >
                      {note || 'Keine Bemerkung verfügbar.'}
                    </Typography>
                  )}

                  <Box display='flex' marginTop={2} justifyContent='flex-end'>
                    {isEditMode ? (
                      <>
                        <Button className={classes.popperButton} onClick={handleCancelEdit}>
                          Abbrechen
                        </Button>

                        <SubmitButton
                          color='primary'
                          isSubmitting={isSubmitting}
                          disabled={!isValid}
                        >
                          Speichern
                        </SubmitButton>
                      </>
                    ) : (
                      <>
                        <Button className={classes.popperButton} onClick={handlePopperClose}>
                          Schließen
                        </Button>

                        <Button
                          color='primary'
                          startIcon={<EditIcon />}
                          onClick={() => setEditMode(true)}
                        >
                          Bearbeiten
                        </Button>
                      </>
                    )}
                  </Box>
                </form>
              )}
            </Formik>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}

export default AttendanceNotePopper;
