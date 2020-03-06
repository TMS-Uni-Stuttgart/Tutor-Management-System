import React from 'react';
import Markdown from '../components/Markdown';
import { Sheet } from '../model/Sheet';
import { Team } from '../model/Team';
import { saveBlob } from '../util/helperFunctions';
import { DialogHelpers, useDialog } from './DialogService';
import {
  getCorrectionCommentPDFs,
  getTeamCorrectionCommentMarkdown,
  getTeamCorrectionCommentPDF,
} from './fetching/Files';
import { getTutorial } from './fetching/Tutorial';

interface DialogOption {
  dialog: DialogHelpers;
}

interface CorrectionPdfOptions {
  tutorialId: string;
  sheet: Sheet;
  team: Team;
}

interface GenerateAllPDFsOptions {
  tutorialId: string;
  sheet: Sheet;
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
