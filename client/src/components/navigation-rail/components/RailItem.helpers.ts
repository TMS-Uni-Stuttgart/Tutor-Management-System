import { useRouteMatch } from 'react-router';
import { RailSubItemProps } from './RailSubItem';

// TODO: Can this function's usages be replaces by "Route.create({})" calls?
export function getTargetLink(path: string): string {
  if (!path.endsWith('?')) {
    return path;
  }

  const idx = path.lastIndexOf('/');

  return path.substring(0, idx);
}

export function useIsCurrentPath(path: string, subItems: RailSubItemProps[] | undefined): boolean {
  const pathsToCheck: string[] = [path];

  if (!!subItems && subItems.length > 0) {
    pathsToCheck.push(...subItems.map((item) => item.subPath));
  }

  return !!useRouteMatch(pathsToCheck);
}
