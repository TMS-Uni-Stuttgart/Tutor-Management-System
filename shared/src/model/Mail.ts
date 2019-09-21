export interface FailedMail {
  userId: string | 'UNKNOWN';
}

export interface MailingStatus {
  successFullSend: number;
  failedMailsInfo: FailedMail[];
}
