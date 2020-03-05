import React from 'react';
import { useDialog, DialogHelpers } from './DialogService';
import Markdown from '../components/Markdown';
import {
  getTeamCorrectionCommentMarkdown,
  getTeamCorrectionCommentPDF,
  getCorrectionCommentPDFs,
} from './fetching/Files';
import { ISheet } from 'shared/model/Sheet';
import { ITeam } from 'shared/model/Team';
import { saveBlob } from '../util/helperFunctions';
import { getTutorial } from './fetching/Tutorial';

interface DialogOption {
  dialog: DialogHelpers;
}

interface CorrectionPdfOptions {
  tutorialId: string;
  sheet: ISheet;
  team: ITeam;
}

interface GenerateAllPDFsOptions {
  tutorialId: string;
  sheet: ISheet;
}

async function showSinglePdfPreview({
  dialog,
  tutorialId,
  sheet,
  team,
}: CorrectionPdfOptions & DialogOption) {
  const markdownSource = await getTeamCorrectionCommentMarkdown(tutorialId, sheet.id, team.id);

  dialog.show({
    actions: [
      {
        label: 'Schließen',
        onClick: () => dialog.hide(),
      },
    ],
    DialogProps: {
      maxWidth: 'lg',
    },
    title: 'Markdown-Vorschau',
    content: <Markdown markdown={markdownSource} />,
    onClose: () => dialog.hide(),
  });
}

async function generateSinglePdf({ tutorialId, sheet, team }: CorrectionPdfOptions) {
  const blob = await getTeamCorrectionCommentPDF(tutorialId, sheet.id, team.id);
  const teamName = team.students.map(s => s.lastname).join('');
  const sheetNo = sheet.sheetNo.toString().padStart(2, '0');

  saveBlob(blob, `Ex${sheetNo}_${teamName}.pdf`);
}

async function generateAllPdfs({ tutorialId, sheet }: GenerateAllPDFsOptions) {
  const [blob, tutorial] = await Promise.all([
    getCorrectionCommentPDFs(tutorialId, sheet.id),
    getTutorial(tutorialId),
  ]);

  saveBlob(blob, `Bewertungen_Ex${sheet.sheetNo.toString().padStart(2, '0')}_${tutorial.slot}.zip`);
}

export function usePDFs() {
  const dialog = useDialog();

  return {
    showSinglePdfPreview: (options: CorrectionPdfOptions) =>
      showSinglePdfPreview({ dialog, ...options }),
    generateSinglePdf,
    generateAllPdfs,
  };
}
