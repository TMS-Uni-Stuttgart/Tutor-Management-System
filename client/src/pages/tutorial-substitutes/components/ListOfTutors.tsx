import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { NamedElement } from 'shared/model/Common';
import { getNameOfEntity } from 'shared/util/helpers';
import OutlinedBox from '../../../components/OutlinedBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    scrollableBox: {
      overflowY: 'auto',
      paddingRight: theme.spacing(0.5),
      ...theme.mixins.scrollbar(8),
    },
    tutorRowBackground: {
      borderColor: alpha(theme.palette.text.primary, 0.23),
      cursor: 'pointer',
      '&:hover': {
        background: alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
      },
    },
    selectedTutor: {
      color: theme.palette.orange.main,
      borderColor: alpha(theme.palette.orange.main, 0.5),
      cursor: 'default',
    },
  })
);

interface Props {
  tutorsToShow: NamedElement[];
  onSelect: (tutor: NamedElement) => void;
  selectedSubstitute?: NamedElement;
}

function ListOfTutors({ tutorsToShow, onSelect, selectedSubstitute }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Box
      display='grid'
      gridTemplateColumns='1fr'
      rowGap={8}
      alignItems='center'
      className={classes.scrollableBox}
    >
      {tutorsToShow.map((tutor) => {
        const isSelected = tutor.id === selectedSubstitute?.id;

        return (
          <OutlinedBox
            key={tutor.id}
            display='grid'
            gridTemplateColumns='1fr fit-content(50%)'
            padding={2}
            alignItems='center'
            justifyContent='flex-start'
            textAlign='start'
            className={clsx(classes.tutorRowBackground, isSelected && classes.selectedTutor)}
            component={ButtonBase}
            onClick={() => onSelect(tutor)}
          >
            <Typography>{getNameOfEntity(tutor)}</Typography>
            <Typography variant='button' className={clsx(false && classes.selectedTutor)}>
              {isSelected ? 'Ausgewählt' : 'Auswählen'}
            </Typography>
          </OutlinedBox>
        );
      })}
    </Box>
  );
}

export default ListOfTutors;
