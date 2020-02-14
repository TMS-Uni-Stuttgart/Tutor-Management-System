import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useEffect, useState } from 'react';
import {
  ScheinCriteriaResponse as ScheinCriteria,
  ScheinCriteriaDTO,
} from 'shared/model/ScheinCriteria';
import ScheinCriteriaForm, {
  ScheinCriteriaFormCallback,
} from '../../components/forms/ScheinCriteriaForm';
import { FormDataResponse } from '../../components/generatedForm/types/FieldData';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import TableWithForm from '../../components/TableWithForm';
import { useDialog } from '../../hooks/DialogService';
import { useAxios } from '../../hooks/FetchingService';
import ScheinCriteriaRow from './components/ScheinCriteriaRow';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogDeleteButton: {
      color: theme.palette.error.main,
    },
  })
);

function ScheinCriteriaManagement({ enqueueSnackbar }: WithSnackbarProps): JSX.Element {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataResponse>({});
  const [criterias, setCriterias] = useState<ScheinCriteria[]>([]);
  const {
    getAllScheinCriterias,
    getScheinCriteriaFormData,
    createScheinCriteria,
    editScheinCriteria,
    deleteScheinCriteria,
  } = useAxios();
  const dialog = useDialog();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getAllScheinCriterias(), getScheinCriteriaFormData()]).then(
      ([criteriaResponse, formResponse]) => {
        setCriterias(criteriaResponse);

        setFormData(formResponse);
        setIsLoading(false);
      }
    );
  }, [getAllScheinCriterias, getScheinCriteriaFormData]);

  const handleCreateCriteria: ScheinCriteriaFormCallback = async (
    { name, identifier, ...values },
    { setSubmitting, resetForm }
  ) => {
    const dto: ScheinCriteriaDTO = {
      identifier,
      name,
      data: {
        ...values,
      },
    };

    try {
      const response = await createScheinCriteria(dto);

      setCriterias([...criterias, response]);
      resetForm();

      enqueueSnackbar(`Kriterium "${dto.name}" erfolgreich erstellt.`, {
        variant: 'success',
      });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar(`Kriterium konnte nicht erstellt werden.`, {
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const editCriteria: (criteria: ScheinCriteria) => ScheinCriteriaFormCallback = criteria => async (
    { name, identifier, ...values },
    { setSubmitting }
  ) => {
    const dto: ScheinCriteriaDTO = {
      identifier,
      name,
      data: {
        ...values,
      },
    };

    try {
      const response = await editScheinCriteria(criteria.id, dto);

      setCriterias(criterias.map(crit => (crit.id === criteria.id ? response : crit)));

      dialog.hide();
      enqueueSnackbar(`Kriterium "${dto.name}" erfolgreich bearbeitet.`, {
        variant: 'success',
      });
    } catch (reason) {
      console.error(reason);
      enqueueSnackbar(`Kriterium konnte nicht bearbeitet werden.`, {
        variant: 'error',
      });
      setSubmitting(false);
    }
  };

  function handleEditCriteria(criteria: ScheinCriteria) {
    dialog.show({
      title: 'Kriterium bearbeiten',
      content: (
        <ScheinCriteriaForm
          formData={formData}
          onSubmit={editCriteria(criteria)}
          criteria={criteria}
          onCancelClicked={() => dialog.hide()}
        />
      ),
    });
  }

  function handleDeleteCriteria(criteria: ScheinCriteria) {
    dialog.show({
      title: 'Nutzer löschen',
      content: `Soll das Kriterium "${criteria.name}" wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden.`,
      actions: [
        {
          label: 'Nicht löschen',
          onClick: () => dialog.hide(),
        },
        {
          label: 'Löschen',
          onClick: () => deleteCriteria(criteria),
          buttonProps: {
            className: classes.dialogDeleteButton,
          },
        },
      ],
    });
  }

  function deleteCriteria(criteria: ScheinCriteria) {
    deleteScheinCriteria(criteria.id)
      .then(() => {
        setCriterias(criterias.filter(c => c.id !== criteria.id));

        enqueueSnackbar(`Kriterium erfolgreich gelöscht.`, {
          variant: 'success',
        });
      })
      .catch(() => {
        enqueueSnackbar(`Kriterium konnte nicht gelöscht werden.`, {
          variant: 'error',
        });
      })
      .finally(() => dialog.hide());
  }

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <TableWithForm
          title='Neues Scheinkriterium erstellen'
          placeholder='Keine Scheinkritrien vorhanden.'
          form={<ScheinCriteriaForm formData={formData} onSubmit={handleCreateCriteria} />}
          items={criterias}
          createRowFromItem={crit => (
            <ScheinCriteriaRow
              criteria={crit}
              onEditCriteriaClicked={handleEditCriteria}
              onDeleteCriteriaClicked={handleDeleteCriteria}
            />
          )}
        />
      )}
    </div>
  );
}

export default withSnackbar(ScheinCriteriaManagement);
