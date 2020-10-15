import { IMarkdownToHTMLPayload } from 'shared/model/Markdown';
import axios from './Axios';

export async function getHTMLFromMarkdown(markdown: string): Promise<string> {
  const payload: IMarkdownToHTMLPayload = { markdown };
  const response = await axios.post<string>('markdown/html', payload);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}
