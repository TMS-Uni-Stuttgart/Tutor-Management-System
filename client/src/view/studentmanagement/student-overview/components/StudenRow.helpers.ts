import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';

export function calculateProgress(summary: ScheinCriteriaSummary) {
  let achieved = 0;
  let total = 0;

  Object.values(summary.scheinCriteriaSummary).forEach(status => {
    const infos = Object.values(status.infos);

    if (status.passed) {
      achieved += 1;
      total += 1;
    } else {
      if (infos.length > 0) {
        infos.forEach(info => {
          achieved += info.achieved / info.total;
          total += 1;
        });
      } else {
        achieved += status.achieved / status.total;
        total += 1;
      }
    }
  });

  return (achieved / total) * 100;
}
