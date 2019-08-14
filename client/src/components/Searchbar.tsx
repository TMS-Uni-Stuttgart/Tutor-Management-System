import { IconButton, InputBase, Paper } from '@material-ui/core';
import { InputBaseProps } from '@material-ui/core/InputBase';
import { PaperProps } from '@material-ui/core/Paper';
import { Close as CloseIcon, Search as SearchIcon } from '@material-ui/icons';
import { createStyles, makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(
  createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      // width: 400
    },
    input: {
      marginLeft: 8,
      flex: 1,
    },
    searchIcon: {
      margin: 8,
    },
    iconButton: {
      padding: 8,
    },
  })
);

interface Props extends InputBaseProps {
  PaperProps?: PaperProps;
  showClearButton?: boolean;
  onClearClicked?: () => void;
}

function Searchbar(props: Props): JSX.Element {
  const {
    PaperProps,
    placeholder,
    onChange,
    onClearClicked,
    showClearButton,
    value,
    className,
    ...rest
  } = props;
  const classes = useStyles();

  return (
    <Paper elevation={1} {...PaperProps} className={clsx(classes.root, className)}>
      <SearchIcon className={classes.searchIcon} />

      <InputBase
        placeholder={placeholder}
        value={value}
        {...rest}
        className={classes.input}
        onChange={onChange}
      />

      {showClearButton && (
        <IconButton className={classes.iconButton} onClick={onClearClicked}>
          <CloseIcon />
        </IconButton>
      )}
    </Paper>
  );
}

export default Searchbar;
