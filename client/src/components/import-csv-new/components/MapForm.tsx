import { Box, Button, TextField, Tooltip, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { FieldArray, Formik, FormikProps } from 'formik';
import {
  ArrowExpandLeft as FromLastIcon,
  ArrowExpandRight as FromFirstIcon,
  CheckBold as SubmitIcon,
} from 'mdi-material-ui';
import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { FormikSubmitCallback } from '../../../types';
import FormikDebugDisplay from '../../forms/components/FormikDebugDisplay';
import FormikSelect from '../../forms/components/FormikSelect';
import OutlinedBox from '../../OutlinedBox';
import { CSVMapColumsMetadata } from '../ImportCSV.types';
import {
  DynamicBoxData,
  generateInitialValues,
  getDynamicData,
  groupStaticData,
  StaticBoxGroup,
} from './MapForm.helpers';

const useStyles = makeStyles((theme) =>
  createStyles({
    modeButtons: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
    modeIcon: {
      marginRight: theme.spacing(1),
    },
    modeSubmitButton: {
      margin: 'auto 0px',
    },
  })
);

export type MapFormValues = Record<string, string | string[]>;
export type Metadata = CSVMapColumsMetadata<string, string>;

interface Props {
  headers: string[];
  metadata: Metadata;
  onSubmit: FormikSubmitCallback<MapFormValues>;
  formikRef?: React.Ref<FormikProps<MapFormValues>>;
}

interface MapBoxProps {
  title: string;
}

interface MapDynamicColumnInformation {
  count: number;
  selectionMode: 'first' | 'last';
}

interface MapDynamicFormProps {
  headerCount: number;
  onSubmit: (info: MapDynamicColumnInformation) => void;
}

function MapBox({ children, title }: PropsWithChildren<MapBoxProps>): JSX.Element {
  return (
    <OutlinedBox
      display='flex'
      flexDirection='column'
      marginTop={2}
      paddingX={1.5}
      paddingY={1}
      gridRowGap={8}
    >
      <Typography variant='h6' style={{ marginBottom: 16 }}>
        {title}
      </Typography>

      {children}
    </OutlinedBox>
  );
}

function MapDynamicForm({ onSubmit, headerCount }: MapDynamicFormProps): JSX.Element {
  const classes = useStyles();
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState<'first' | 'last'>('last');
  const [error, setError] = useState<string>();

  const validate = useCallback(
    (countToValidate: number) => {
      if (countToValidate <= 0) {
        setError('Die Anzahl muss positiv sein.');
      } else if (countToValidate > headerCount) {
        setError(`Höher als die maximale Spaltenanzahl (${headerCount}).`);
      } else {
        setError(undefined);
      }
    },
    [headerCount]
  );

  const handleSubmit = useCallback(() => {
    validate(count);

    if (!error) {
      onSubmit({ count, selectionMode: mode });
    }
  }, [count, mode, onSubmit, error, validate]);

  return (
    <Box display='flex' flexDirection='row'>
      <TextField
        label='Anzahl Aufgaben'
        type='number'
        value={count}
        onChange={(e) => {
          const newCount = Number.parseInt(e.target.value, 10);
          setCount(newCount);
          validate(newCount);
        }}
        helperText={!!error && error}
        error={!!error}
      />

      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, newMode) => {
          if (!!newMode) {
            setMode(newMode);
          }
        }}
        className={classes.modeButtons}
      >
        <ToggleButton value='last'>
          <FromLastIcon className={classes.modeIcon} /> Von hinten
        </ToggleButton>
        <ToggleButton value='first'>
          <FromFirstIcon className={classes.modeIcon} /> Von vorne
        </ToggleButton>
      </ToggleButtonGroup>

      <Tooltip title='Bestätigen'>
        <Button startIcon={<SubmitIcon />} color='primary' onClick={handleSubmit}>
          Bestätigen
        </Button>
      </Tooltip>
    </Box>
  );
}

function MapForm({ headers, metadata, formikRef, onSubmit }: Props): JSX.Element {
  const initialValues: MapFormValues = useMemo(() => generateInitialValues(metadata, headers), [
    metadata,
    headers,
  ]);
  const staticDataByBoxes: StaticBoxGroup[] = useMemo(() => groupStaticData(metadata), [metadata]);
  const dynamicData: DynamicBoxData[] = useMemo(() => getDynamicData(metadata), [metadata]);
  const sortedHeaders = useMemo(() => [...headers].sort((a, b) => a.localeCompare(b)), [headers]);

  return (
    <Formik
      innerRef={formikRef}
      onSubmit={onSubmit}
      initialValues={initialValues}
      enableReinitialize
    >
      {({ values }) => (
        <Box display='grid' gridTemplateColumns='1fr' gridRowGap={16}>
          {staticDataByBoxes.map((data) => (
            <MapBox key={data.key} title={data.title}>
              <Box
                display='grid'
                gridColumn='1fr'
                gridAutoRows='auto'
                gridAutoFlow='row'
                gridRowGap={28}
                gridColumnGap={8}
              >
                {data.boxData.map(({ key, label, required, helperText }) => (
                  <FormikSelect
                    key={key}
                    name={key}
                    label={label}
                    required={required}
                    helperText={helperText}
                    nameOfNoneItem={!required ? 'Keine Spalte auswählen.' : undefined}
                    items={sortedHeaders}
                    itemToValue={(i) => i}
                    itemToString={(i) => i}
                    emptyPlaceholder='Keine Überschriften verfügbar.'
                  />
                ))}
              </Box>
            </MapBox>
          ))}

          {dynamicData.map((data) => (
            <FieldArray key={data.key} name={data.key}>
              {({}) => (
                <MapBox title={data.title}>
                  {values[data.key].length > 0 ? (
                    <div>TODO: IMPLEMENT DERPY {/* TODO: CHILDREN! */}</div>
                  ) : (
                    <MapDynamicForm
                      headerCount={headers.length}
                      onSubmit={() => {
                        // TODO: Implement me!
                      }}
                    />
                  )}
                </MapBox>
              )}
            </FieldArray>
          ))}

          <FormikDebugDisplay />
        </Box>
      )}
    </Formik>
  );
}

export default MapForm;
