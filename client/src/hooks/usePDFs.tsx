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

interface GenerateAllPdfsOptions {
  tutorialId: string;
  sheet: Sheet;
}

interface UsePdfs {
  showSinglePdfPreview: (options: CorrectionPdfOptions) => Promise<void>;
  generateSinglePdf: (options: CorrectionPdfOptions) => Promise<void>;
  generateAllPdfs: (options: GenerateAllPdfsOptions) => Promise<void>;
}

async function showSinglePdfPreview({
  dialog,
  tutorialId,
  sheet,
  team,
}: CorrectionPdfOptions & DialogOption) {
  const markdownSource = await getTeamCorrectionCommentMarkdown(tutorialId, sheet.id, team.id);
  let content: React.ReactNode;

  if (markdownSource.length <= 1) {
    content = <Markdown markdown={markdownSource[0]?.markdown ?? ''} />;
  } else {
    // TODO: Implement this!!!
    content = <div>MULTIPLE PDFS</div>;
  }

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
    content,
    onClose: () => dialog.hide(),
  });
}

async function generateSinglePdf({ tutorialId, sheet, team }: CorrectionPdfOptions) {
  const blob = await getTeamCorrectionCommentPDF(tutorialId, sheet.id, team.id);
  const teamName = team.students.map((s) => s.lastname).join('');
  const sheetNo = sheet.sheetNo.toString().padStart(2, '0');
  const fileEnding = blob.type === 'application/pdf' ? 'pdf' : 'zip';

  saveBlob(blob, `Ex${sheetNo}_${teamName}.${fileEnding}`);
}

async function generateAllPdfs({ tutorialId, sheet }: GenerateAllPdfsOptions) {
  const [blob, tutorial] = await Promise.all([
    getCorrectionCommentPDFs(tutorialId, sheet.id),
    getTutorial(tutorialId),
  ]);

  saveBlob(blob, `Bewertungen_Ex${sheet.sheetNo.toString().padStart(2, '0')}_${tutorial.slot}.zip`);
}

export function usePDFs(): UsePdfs {
  const dialog = useDialog();

  return {
    showSinglePdfPreview: (options: CorrectionPdfOptions) =>
      showSinglePdfPreview({ dialog, ...options }),
    generateSinglePdf,
    generateAllPdfs,
  };
}
