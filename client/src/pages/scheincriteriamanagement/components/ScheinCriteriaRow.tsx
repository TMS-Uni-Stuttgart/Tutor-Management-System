import { TableCell, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { InformationOutline as InfoIcon } from 'mdi-material-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { IScheinCriteria } from 'shared/model/ScheinCriteria';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
import { ROUTES } from '../../../routes/Routing.routes';
import { i18nNamespace } from '../../../util/lang/configI18N';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    infoCell: {
      display: 'grid',
      gridTemplateColumns: 'max-content 1fr',
      gridRowGap: theme.spacing(1),
      gridColumnGap: theme.spacing(1.5),
    },
  })
);

interface Props extends PaperTableRowProps {
  criteria: IScheinCriteria;
  onEditCriteriaClicked: (criteria: IScheinCriteria) => void;
  onDeleteCriteriaClicked: (criteria: IScheinCriteria) => void;
}

function ScheinCriteriaRow({
  criteria,
  onEditCriteriaClicked,
  onDeleteCriteriaClicked,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation(i18nNamespace.SCHEINCRITERIA);

  return (
    <PaperTableRow
      label={criteria.name}
      subText={`Typ: ${t(`TYPE_${criteria.identifier}`)}`}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditCriteriaClicked(criteria)}
          onDeleteClicked={() => onDeleteCriteriaClicked(criteria)}
          additionalItems={[
            {
              primary: 'Informationen',
              Icon: InfoIcon,
              onClick: () => {
                history.push(ROUTES.SCHEIN_CRITERIAS_INFO.create({ id: criteria.id }));
              },
            },
          ]}
        />
      }
      {...rest}
    >
      <TableCell className={classes.infoCell}>
        {Object.entries(criteria.data).map(([key, value]) => {
          if (key === 'id' || key === 'name' || key === 'identifier') {
            return null;
          }

          const valueAsString = String(value);

          return (
            <React.Fragment key={key}>
              <Typography component='span'>{`${t('VALUE_' + key)}:`}</Typography>
              {`${valueAsString}` === 'true' || `${valueAsString}` === 'false' ? (
                <Typography component='span'>{t(valueAsString)}</Typography>
              ) : key.startsWith('percentage') ? (
                <Typography component='span'>{`${
                  Number.parseFloat(valueAsString) * 100
                } %`}</Typography>
              ) : (
                <Typography component='span'>{`${valueAsString}`}</Typography>
              )}
            </React.Fragment>
          );
        })}
      </TableCell>
    </PaperTableRow>
  );
}

export default ScheinCriteriaRow;
