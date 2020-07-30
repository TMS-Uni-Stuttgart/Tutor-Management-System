import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { UserDocument } from '../../database/models/user.model';
import { VALID_EMAIL_REGEX } from '../../helpers/validators/nodemailer.validator';
import { FailedMail, MailingStatus } from '../../shared/model/Mail';
import { getNameOfEntity } from '../../shared/util/helpers';
import { MailingConfiguration } from '../settings/model/MailingConfiguration';
import { SettingsService } from '../settings/settings.service';
import { TemplateService } from '../template/template.service';
import { UserService } from '../user/user.service';

class MailingError {
  constructor(readonly userId: string, readonly message: string, readonly err: unknown) {}
}

interface SendMailParams {
  user: UserDocument;
  transport: Mail;
  options: MailingConfiguration;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly userService: UserService,
    private readonly settingsService: SettingsService,
    private readonly templateService: TemplateService
  ) {}

  /**
   * Sends a mail with the credentials to all users.
   *
   * The mail is only sent to users which are not the 'admin' user and which did not already changed their initial password (ie still have a temporary password).
   *
   * @returns Data containing information about the amount of successfully send mails and information about failed ones.
   */
  async mailCredentials(): Promise<MailingStatus> {
    const options = await this.settingsService.getMailingOptions();

    if (!options) {
      throw new InternalServerErrorException('MISSING_MAIL_SETTINGS');
    }

    const transport = this.createSMTPTransport(options);
    const usersToMail = (await this.userService.findAll()).filter(
      (u) => u.username !== 'admin' && !!u.temporaryPassword
    );
    const mails: Promise<SentMessageInfo>[] = [];
    const failedMails: FailedMail[] = [];

    for (const user of usersToMail) {
      if (this.isValidEmail(user.email)) {
        mails.push(this.sendMail({ user, transport, options }));
      } else {
        failedMails.push({ userId: user.id, reason: 'INVALID_EMAIL_ADDRESS' });
      }
    }

    const status = this.generateMailingStatus(await Promise.allSettled(mails));
    transport.close();

    return status;
  }

  /**
   * Sends a mail with the credentials to the user with the given ID.
   *
   * The mail is only sent to uthe user if he/she has not already changed their initial password.
   *
   * @returns Data containing information about the amount of successfully send mails (1) and information on failure.
   */
  async mailSingleCredentials(userId: string): Promise<MailingStatus> {
    const options = await this.settingsService.getMailingOptions();

    if (!options) {
      throw new InternalServerErrorException('MISSING_MAIL_SETTINGS');
    }

    const transport = this.createSMTPTransport(options);
    const user = await this.userService.findById(userId);

    if (!user.temporaryPassword) {
      return {
        successFullSend: 0,
        failedMailsInfo: [{ userId: user.id, reason: 'NO_TEMP_PWD_ON_USER' }],
      };
    }

    if (!this.isValidEmail(user.email)) {
      return {
        successFullSend: 0,
        failedMailsInfo: [{ userId: user.id, reason: 'INVALID_EMAIL_ADDRESS' }],
      };
    }

    const status = await Promise.allSettled([this.sendMail({ user, transport, options })]);
    transport.close();

    return this.generateMailingStatus(status);
  }

  /**
   * Converts the given promise results into a `MailingStatus` object extracting the important information:
   *
   * - Information about all failed ones.
   * - Amount of successfully sent ones.
   *
   * @param promiseResults All promise results from settled promises sending mails.
   * @returns `MailingStatus` according to the responses.
   */
  private generateMailingStatus(
    promiseResults: PromiseSettledResult<SentMessageInfo>[]
  ): MailingStatus {
    const status: MailingStatus = { failedMailsInfo: [], successFullSend: 0 };

    for (const mail of promiseResults) {
      if (mail.status === 'fulfilled') {
        status.successFullSend += 1;
      } else {
        if (mail.reason instanceof MailingError) {
          status.failedMailsInfo.push({
            userId: mail.reason.userId,
            reason: `${mail.reason.message}:\n${JSON.stringify(mail.reason.err, null, 2)}`,
          });
        } else {
          status.failedMailsInfo.push({ userId: 'UNKNOWN', reason: 'UNKNOWN_ERROR' });
        }
      }
    }

    return status;
  }

  /**
   * Tries to send a mail with the credentials of the given user.
   *
   * If the mail was sent successfully a `SentMessageInfo` is returned. If it fails an error is thrown.
   *
   * @param user User to send the mail to
   * @param options MailingConfiguration
   * @param transport Transport to use.
   *
   * @returns Info about the sent message.
   * @throws `MailingError` - If the mail could not be successfully send.
   */
  private async sendMail({ user, options, transport }: SendMailParams): Promise<SentMessageInfo> {
    try {
      return await transport.sendMail({
        from: options.from,
        to: user.email,
        subject: 'TMS Credentials', // TODO: Make configurable
        html: this.getTextOfMail(user),
      });
    } catch (err) {
      throw new MailingError(user.id, 'SEND_MAIL_FAILED', err);
    }
  }

  /**
   * @param user User to get the mail text for.
   * @returns The mail template filled with the data of the given user
   */
  private getTextOfMail(user: UserDocument): string {
    const template = this.templateService.getMailTemplate();
    return template({
      name: getNameOfEntity(user, { firstNameFirst: true }),
      username: user.username,
      password: user.temporaryPassword ?? 'NO_TMP_PASSWORD',
    });
  }

  /**
   * @param options Options to create the transport with.
   * @returns A nodemail SMTPTransport instance created with the given options.
   */
  private createSMTPTransport(options: MailingConfiguration): Mail {
    // TODO: Add testingMode with ethereal!
    return nodemailer.createTransport(options);
  }

  /**
   * @param email String to check.
   * @returns Is the string a valid email address?
   */
  private isValidEmail(email: string): boolean {
    return VALID_EMAIL_REGEX.test(email);
  }

  // private isOAuth2(auth: SMTPConnection.AuthenticationType): auth is AuthenticationTypeOAuth2 {
  //   return auth.type === 'oauth2' || auth.type === 'OAuth2' || auth.type === 'OAUTH2';
  // }

  // private isBasicAuth(auth: SMTPConnection.AuthenticationType): auth is AuthenticationTypeLogin {
  //   return !auth.type || auth.type === 'login' || auth.type === 'Login' || auth.type === 'LOGIN';
  // }
}
