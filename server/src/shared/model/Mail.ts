export interface FailedMail {
    userId: string;
    reason: string;
}

export interface MailingStatus {
    successFullSend: number;
    failedMailsInfo: FailedMail[];
}
