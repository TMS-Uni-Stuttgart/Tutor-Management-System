import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

export const useStyles = makeStyles((theme: Theme) => {
  const align = theme.direction === 'rtl' ? 'right' : 'left';

  return createStyles({
    /* Styles applied to the root element. */
    root: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      top: -5,
      left: 0,
      margin: 0,
      padding: 0,
      pointerEvents: 'none',
      borderRadius: theme.shape.borderRadius,
      borderStyle: 'solid',
      borderWidth: 1,
      // Match the Input Label
      transition: theme.transitions.create([`padding-${align}`, 'border-color', 'border-width'], {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
      }),
    },
    /* Styles applied to the legend element. */
    legend: {
      textAlign: 'left',
      padding: 0,
      lineHeight: '11px',
      transition: theme.transitions.create('width', {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
      }),
    },
  });
});

interface Props extends React.ComponentProps<'fieldset'> {
  labelWidth: number;
  notched: boolean;
}

/**
 * @ignore - internal component.
 */
const NotchedOutline = React.forwardRef<HTMLFieldSetElement, Props>(function NotchedOutline(
  props: Props,
  ref
) {
  const { children, className, labelWidth: labelWidthProp, notched, style, ...other } = props;

  const classes = useStyles();
  const labelWidth = labelWidthProp > 0 ? labelWidthProp * 0.75 + 8 : 0;

  return (
    <fieldset
      aria-hidden
      style={{
        [`paddingLeft`]: 8 + (notched ? 0 : labelWidth / 2),
        ...style,
      }}
      className={clsx(classes.root, className)}
      ref={ref}
      {...other}
    >
      <legend
        className={classes.legend}
        style={{
          // IE 11: fieldset with legend does not render
          // a border radius. This maintains consistency
          // by always having a legend rendered
          width: notched ? labelWidth : 0.01,
        }}
      >
        {/* Use the nominal use case of the legend, avoid rendering artefacts. */}
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: '&#8203;' }} />
      </legend>
    </fieldset>
  );
});

export default NotchedOutline;
