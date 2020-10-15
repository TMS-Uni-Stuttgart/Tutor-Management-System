import {
  IMarkdownHTML,
  IMarkdownToHTMLPayload,
  IStudentMarkdownData,
  ITeamMarkdownData,
} from 'shared/model/Markdown';
import axios from './Axios';

export async function getHTMLFromMarkdown(markdown: string): Promise<string> {
  const payload: IMarkdownToHTMLPayload = { markdown };
  const response = await axios.post<IMarkdownHTML>('markdown/html', payload);

  if (response.status === 200) {
    return response.data.html;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getStudentCorrectionCommentMarkdown(
  sheetId: string,
  studentId: string
): Promise<string> {
  const response = await axios.get<IStudentMarkdownData>(
    `/markdown/grading/${sheetId}/student/${studentId}`
  );

  if (response.status === 200) {
    return response.data.markdown;
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}

export async function getTeamCorrectionCommentMarkdown(
  tutorialId: string,
  sheetId: string,
  teamId: string
): Promise<ITeamMarkdownData[]> {
  const response = await axios.get<ITeamMarkdownData[]>(
    `/markdown/grading/${sheetId}/tutorial/${tutorialId}/team/${teamId}`
  );

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status})`);
}
