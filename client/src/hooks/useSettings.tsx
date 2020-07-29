import React, { useCallback, useContext, useEffect } from 'react';
import { Role } from 'shared/model/Role';
import { IClientSettings } from 'shared/model/Settings';
import { RequireChildrenProp } from '../typings/RequireChildrenProp';
import { throwContextNotInitialized } from '../util/throwFunctions';
import { getSettings } from './fetching/Settings';
import { useLogin } from './LoginService';
import { useFetchState } from './useFetchState';

interface ContextType {
  settings: IClientSettings;
  isLoadingSettings: boolean;
  canStudentBeExcused: () => boolean;
  updateSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: IClientSettings = { defaultTeamSize: 1, canTutorExcuseStudents: false };

const SettingsContext = React.createContext<ContextType>({
  settings: DEFAULT_SETTINGS,
  isLoadingSettings: false,
  canStudentBeExcused: throwContextNotInitialized('SettingsContext'),
  updateSettings: throwContextNotInitialized('SettingsContext'),
});

export function SettingsProvider({ children }: RequireChildrenProp): JSX.Element {
  const { userData } = useLogin();
  const { value, isLoading, execute } = useFetchState({ fetchFunction: getSettings });
  const updateSettings = useCallback(async () => {
    if (!!userData) {
      await execute();
    }
  }, [userData, execute]);

  useEffect(() => {
    updateSettings();
  }, [updateSettings]);

  const canStudentBeExcused = useCallback(() => {
    if (!value) {
      return false;
    }

    if (value.canTutorExcuseStudents) {
      return true;
    }

    return !!userData && userData.roles.includes(Role.ADMIN);
  }, [userData, value]);

  return (
    <SettingsContext.Provider
      value={{
        settings: value ?? DEFAULT_SETTINGS,
        isLoadingSettings: isLoading,
        canStudentBeExcused,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): ContextType {
  return useContext(SettingsContext);
}