import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  ButtonProps,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@material-ui/core';
import { createStyles, fade, makeStyles } from '@material-ui/core/styles';
import { MenuDown as ArrowDropDownIcon } from 'mdi-material-ui';
import React from 'react';
import { useLogger } from '../util/Logger';

const useStyles = makeStyles((theme) =>
  createStyles({
    button: {
      '&:hover': {
        background: fade(theme.palette.primary.main, theme.palette.action.hoverOpacity),
      },
      '&:not(:last-child)': {
        borderRightColor: theme.palette.getContrastText(theme.palette.primary.main),
      },
    },
  })
);

interface ButtonOption {
  label: string;
  disabled?: boolean;
  ButtonProps?: ButtonProps & { component?: React.ElementType; to?: string };
}

interface Props extends ButtonGroupProps {
  options: ButtonOption[];
  initiallySelected?: number;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
}

function SplitButton({ options, initiallySelected, variant, color, ...props }: Props): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const logger = useLogger('SplitButton');
  const [selectedIndex, setSelectedIndex] = React.useState(() => {
    if (initiallySelected === undefined) {
      return 0;
    }

    if (initiallySelected < 0 || initiallySelected >= options.length) {
      logger.warn(`Initially selected value is invalid. Value: ${initiallySelected}`);
      return 0;
    }

    return initiallySelected;
  });
  const classes = useStyles();

  const { ButtonProps: buttonProps } = options[selectedIndex];

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        variant={variant}
        color={color}
        ref={anchorRef}
        aria-label='split button'
        {...props}
        classes={{ grouped: classes.button }}
      >
        <Button disabled={options[selectedIndex].disabled} {...buttonProps}>
          {options[selectedIndex].label}
        </Button>
        <Button
          size='small'
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup='menu'
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.label}
                      disabled={option.disabled ?? false}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default SplitButton;
