import React, { useContext } from 'react';
import { IClientSettings } from 'shared/model/Settings';
import { RequireChildrenProp } from '../typings/RequireChildrenProp';
import { getSettings } from './fetching/Settings';
import { useFetchState } from './useFetchState';

interface ContextType {
  settings: IClientSettings;
  isLoadingSettings: boolean;
}

const DEFAULT_SETTINGS: IClientSettings = { defaultTeamSize: 1, canTutorExcuseStudents: false };

const SettingsContext = React.createContext<ContextType>({
  settings: DEFAULT_SETTINGS,
  isLoadingSettings: false,
});

export function SettingsProvider({ children }: RequireChildrenProp): JSX.Element {
  const { value, isLoading } = useFetchState({
    fetchFunction: getSettings,
    immediate: true,
    params: [],
  });

  return (
    <SettingsContext.Provider
      value={{ settings: value ?? DEFAULT_SETTINGS, isLoadingSettings: isLoading }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): ContextType {
  return useContext(SettingsContext);
}
