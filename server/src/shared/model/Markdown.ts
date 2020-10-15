export interface ITeamMarkdownData {
  readonly teamName: string;
  readonly markdown: string;
  readonly belongsToTeam: boolean;
}

export interface IMarkdownToHTMLPayload {
  markdown: string;
}
