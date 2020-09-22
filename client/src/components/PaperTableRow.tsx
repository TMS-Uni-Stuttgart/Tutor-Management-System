import {
  Avatar,
  TableCell,
  TableCellProps,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { AvatarProps } from '@material-ui/core/Avatar';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TypographyProps } from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { SvgIconComponent } from '../typings/SvgIconComponent';

interface StyleProps {
  colorOfBottomBar?: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) =>
  createStyles({
    content: {
      '&:hover': {
        background: theme.palette.action.hover,
        // background: theme.palette.grey[200],
      },
      '& td': {
        // Make sure the "table row" has a proper border radius
        // This is needed here bc one cannot add borderRadius to tr elements.
        '&:first-child': {
          borderTopLeftRadius: theme.shape.borderRadius,
          borderBottomLeftRadius: theme.shape.borderRadius,
        },
        '&:last-child': {
          borderTopRightRadius: theme.shape.borderRadius,
          borderBottomRightRadius: theme.shape.borderRadius,
        },
      },
    },
    coloredBar: (props) => {
      if (props.colorOfBottomBar) {
        return {
          borderBottom: `4px solid ${props.colorOfBottomBar}`,
        };
      }

      return {
        bottomBorder: 'none',
      };
    },
    avatarCell: {
      paddingLeft: theme.spacing(2),
    },
    buttonCell: {
      whiteSpace: 'nowrap',
    },
  })
);

interface Props {
  label: string;
  subText?: string;
  LabelCellProps?: TableCellProps;
  LabelProps?: TypographyProps;
  SubTextProps?: TypographyProps;
  buttonCellContent?: React.ReactNode;
  colorOfBottomBar?: string;
  Avatar?: React.ReactNode;
  icon?: SvgIconComponent;
  avatarTooltip?: string;
  AvatarProps?: AvatarProps;
}

export type PaperTableRowProps = Omit<PaperProps, 'component'>;
type PropType = Props & PaperTableRowProps;

function PaperTableRow({
  label,
  subText,
  avatarTooltip,
  icon: Icon,
  className,
  children,
  LabelCellProps,
  LabelProps,
  SubTextProps,
  buttonCellContent: ButtonCellContent,
  colorOfBottomBar,
  Avatar: AvatarFromProps,
  AvatarProps,
  ...rest
}: PropType): JSX.Element {
  const classes = useStyles({ colorOfBottomBar: colorOfBottomBar });
  const AvatarComp: React.ReactElement | undefined = !!AvatarFromProps ? (
    <>{AvatarFromProps}</>
  ) : (
    Icon && (
      <Avatar {...AvatarProps}>
        <Icon />
      </Avatar>
    )
  );

  return (
    <Paper
      {...rest}
      component={TableRow}
      className={clsx(classes.content, className, colorOfBottomBar && classes.coloredBar)}
    >
      {AvatarComp && (
        <TableCell padding='checkbox' className={classes.avatarCell}>
          {avatarTooltip ? <Tooltip title={avatarTooltip}>{AvatarComp}</Tooltip> : AvatarComp}
        </TableCell>
      )}

      <TableCell {...LabelCellProps}>
        <Typography {...LabelProps} className={clsx(LabelProps && LabelProps.className)}>
          {label}
        </Typography>

        {subText && (
          <Typography
            variant='body2'
            color='textSecondary'
            {...SubTextProps}
            className={clsx(SubTextProps && SubTextProps.className, classes.labelCell)}
          >
            {subText}
          </Typography>
        )}
      </TableCell>

      {children}

      {ButtonCellContent && (
        <TableCell align='right' className={classes.buttonCell}>
          {ButtonCellContent}
        </TableCell>
      )}
    </Paper>
  );
}

export default PaperTableRow;
