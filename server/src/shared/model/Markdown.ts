export interface ITeamMarkdownData {
    readonly teamName: string;
    readonly markdown: string;
    readonly html: string;
    readonly belongsToTeam: boolean;
}

export interface IStudentMarkdownData {
    readonly markdown: string;
    readonly html: string;
}

export interface IMarkdownToHTMLPayload {
    readonly markdown: string;
}

export interface IMarkdownHTML {
    readonly html: string;
}
