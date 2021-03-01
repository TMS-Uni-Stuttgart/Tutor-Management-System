import React from 'react';
import MultiGradingPreview from '../components/markdown/MultiGradingPreview';
import { Sheet } from '../model/Sheet';
import { Team } from '../model/Team';
import { saveBlob } from '../util/helperFunctions';
import { DialogHelpers, useDialog } from './dialog-service/DialogService';
import {
  getCorrectionCommentPDFs,
  getCorrectionCommentPDFsFilename,
  getTeamGradingFile,
  getTeamGradingFilename,
} from './fetching/Files';
import { getTeamCorrectionCommentMarkdown } from './fetching/Markdown';

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
    content: <MultiGradingPreview data={markdownSource} />,
    onClose: () => dialog.hide(),
  });
}

async function generateSinglePdf({ tutorialId, sheet, team }: CorrectionPdfOptions) {
  const blob = await getTeamGradingFile(tutorialId, sheet.id, team.id);
  const fileName = await getTeamGradingFilename(tutorialId, sheet.id, team.id);
  const fileEnding = blob.type === 'application/pdf' ? 'pdf' : 'zip';

  saveBlob(blob, `${fileName}.${fileEnding}`);
}

async function generateAllPdfs({ tutorialId, sheet }: GenerateAllPdfsOptions) {
  const [blob, filename] = await Promise.all([
    getCorrectionCommentPDFs(tutorialId, sheet.id),
    getCorrectionCommentPDFsFilename(tutorialId, sheet.id),
  ]);

  saveBlob(blob, `${filename}.zip`);
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
