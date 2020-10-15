export interface ITeamMarkdownData {
  readonly teamName: string;
  readonly markdown: string;
  readonly belongsToTeam: boolean;
}

export interface IStudentMarkdownData {
  readonly markdown: string;
}

export interface IMarkdownToHTMLPayload {
  readonly markdown: string;
}

export interface IMarkdownHTML {
  readonly html: string;
}
