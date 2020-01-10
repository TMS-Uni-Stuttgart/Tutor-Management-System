import { TableCell, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScheinCriteriaResponse as ScheinCriteria } from 'shared/dist/model/ScheinCriteria';
import EntityListItemMenu from '../../../components/list-item-menu/EntityListItemMenu';
import PaperTableRow, { PaperTableRowProps } from '../../../components/PaperTableRow';
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
  criteria: ScheinCriteria;
  onEditCriteriaClicked: (criteria: ScheinCriteria) => void;
  onDeleteCriteriaClicked: (criteria: ScheinCriteria) => void;
}

function ScheinCriteriaRow({
  criteria,
  onEditCriteriaClicked,
  onDeleteCriteriaClicked,
  ...rest
}: Props): JSX.Element {
  const classes = useStyles();
  const { t } = useTranslation(i18nNamespace.SCHEINCRITERIA);

  return (
    <PaperTableRow
      label={criteria.name}
      subText={`Typ: ${t(criteria.identifier)}`}
      buttonCellContent={
        <EntityListItemMenu
          onEditClicked={() => onEditCriteriaClicked(criteria)}
          onDeleteClicked={() => onDeleteCriteriaClicked(criteria)}
        />
      }
      {...rest}
    >
      <TableCell className={classes.infoCell}>
        {Object.entries(criteria).map(([key, value]) => {
          if (key === 'id' || key === 'name' || key === 'identifier') {
            return null;
          }
          return (
            <React.Fragment key={key}>
              <Typography component='span'>{`${t('VALUE_' + key)}:`}</Typography>
              {`${value}` === 'true' || `${value}` === 'false' ? (
                <Typography component='span'>{t(value)}</Typography>
              ) : key.startsWith('percentage') ? (
                <Typography component='span'>{`${value} %`}</Typography>
              ) : (
                <Typography component='span'>{`${value}`}</Typography>
              )}
            </React.Fragment>
          );
        })}
      </TableCell>
    </PaperTableRow>
  );
}

export default ScheinCriteriaRow;
