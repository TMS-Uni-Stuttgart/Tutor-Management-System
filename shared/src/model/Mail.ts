export interface FailedMail {
  userId: string;
}

export interface MailingStatus {
  successFullSend: number;
  failedMailsInfo: FailedMail[];
}
