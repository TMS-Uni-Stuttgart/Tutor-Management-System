import { Box, Button } from '@material-ui/core';
import { FileImportOutline as ImportIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import TableWithForm from '../../../components/TableWithForm';
import { ROUTES } from '../../../routes/Routing.routes';

function ShortTestManagement(): JSX.Element {
  const [isLoading, setLoading] = useState(false);
  const [shortTests, setShortTests] = useState<any[]>([]);

  return (
    <Box>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TableWithForm
            title='Neuen Kurztest erstellen'
            form={<div>Formular Work in Progress </div>}
            items={shortTests}
            createRowFromItem={(shortTest) => <div key={shortTest.id}>Work in Progress</div>}
            placeholder='Keine Kurztests vorhanden.'
            topBarContent={
              <>
                <Button
                  component={Link}
                  // TODO: Add correct route.
                  to={ROUTES.IMPORT_USERS.create({})}
                  startIcon={<ImportIcon />}
                >
                  Importiere Ergebnisse
                </Button>
              </>
            }
          />

          {/* <LoadingModal modalText='Erstelle Ergebnisliste...' open={isGeneratingResults} /> */}
        </>
      )}
    </Box>
  );
}

export default ShortTestManagement;
