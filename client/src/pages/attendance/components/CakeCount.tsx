import React from 'react';
import { CakeVariant as CakeIcon } from 'mdi-material-ui';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Button, Popover, ButtonGroup } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cakeIcon: {
      marginLeft: theme.spacing(0.5),
    },
    popoverRoot: {
      padding: theme.spacing(1),
    },
  })
);

interface Props {
  cakeCount: number;
  onCakeCountChanged: (cakeCount: number) => void;
}

function CakeCount({ cakeCount, onCakeCountChanged }: Props): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleIncreaseCount = () => {
    onCakeCountChanged(++cakeCount);
    handleClose();
  };

  const handleDecreaseCount = () => {
    onCakeCountChanged(--cakeCount);
    handleClose();
  };

  return (
    <>
      <Button variant='outlined' onClick={handleOpen}>
        {cakeCount}
        <CakeIcon className={classes.cakeIcon} />
      </Button>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div className={classes.popoverRoot}>
          <ButtonGroup color='primary' size='large'>
            <Button onClick={handleDecreaseCount} disabled={cakeCount <= 0}>
              -1 <CakeIcon className={classes.cakeIcon} />
            </Button>

            <Button onClick={handleIncreaseCount}>
              +1 <CakeIcon className={classes.cakeIcon} />
            </Button>
          </ButtonGroup>
        </div>
      </Popover>
    </>
  );
}

export default CakeCount;
