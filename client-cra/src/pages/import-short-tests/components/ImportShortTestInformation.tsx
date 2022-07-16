import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import OrderedList from '../../../components/OrderedList';

const useStyles = makeStyles((theme) =>
  createStyles({
    introduction: { marginTop: theme.spacing(2) },
    list: { marginTop: theme.spacing(1) },
  })
);

function ImportShortTestInformation(): JSX.Element {
  const classes = useStyles();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography variant='h4'>Kurztestergebnisse aus dem Ilias exportieren</Typography>

      <Typography className={classes.introduction}>
        Die folgenden Schritte beschreiben, wie man die richtige CSV-Datei aus dem Ilias erhält.
      </Typography>

      <OrderedList
        className={classes.list}
        items={[
          {
            primary:
              'Öffne den entsprechenden Test im Ilias, dessen Ergebnisse eingetragen werden sollen.',
            secondary: 'Nicht den Fragenpool für Tests!',
          },
          { primary: 'Wähle den Reiter "Export" aus.' },
          {
            primary:
              'Wähle als Typ "Erstelle Ergebnisdatei" (engl.: "Create Test Results Export File")',
            secondary:
              'Das ist der einzige Dateityp, der sowohl die Ergebnisse als auch die Ilias-Namen der Studierenden enthält.',
          },
          {
            primary:
              'Klicke auf "Exportdatei erzeugen". Das Ilias erzeugt nun zwei Dateien: Eine XLSX- und eine CSV-Datei.',
            secondary:
              'Die Spracheinstellung im Ilias verändert zwar die Kopfzeilen in der Datei, das TMS funktioniert aber unabhängig von der gewählten Sprache.',
          },
          { primary: 'Lade die CSV-Datei herunter.' },
          { primary: 'Klicke hier im TMS auf "Weiter"', secondary: 'Oben rechts.' },
        ]}
      />
    </Box>
  );
}

export default ImportShortTestInformation;
