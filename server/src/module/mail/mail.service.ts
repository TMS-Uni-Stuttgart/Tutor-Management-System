import config from 'config';
import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPConnection, {
  AuthenticationTypeLogin,
  AuthenticationTypeOAuth2,
} from 'nodemailer/lib/smtp-connection';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MailingStatus, FailedMail } from '../../shared/model/Mail';
import { UserService } from '../user/user.service';
import { UserDocument } from '../../database/models/user.model';

interface AdditionalOptions {
  testingMode?: boolean;
  templates: {
    credentials: string;
  };
}

class MailingError {
  constructor(readonly userId: string, readonly err: Error, readonly message: string) {}
}

type MailingResponse = SMTPTransport.SentMessageInfo | MailingError;
type TransportOptions = SMTPTransport.Options & AdditionalOptions;

export class InvalidConfigurationException {
  constructor(readonly message?: string) {}
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Sends a mail with the credentials to all users with their credentials.
   *
   * The mail is only sent to users which are not the 'admin' user and which did not already changed their initial password.
   *
   * @returns Data containing information about the amount of successfully send mails and information about failed ones.
   */
  async mailCredentials(): Promise<MailingStatus> {
    const options = this.getConfig();
    const smtpTransport = nodemailer.createTransport(options);

    const users = await this.userService.findAll();
    const mails: Promise<MailingResponse>[] = [];
    const userToSendMailTo = users.filter(u => u.username !== 'admin' && !!u.temporaryPassword);

    // TODO: Check that e-mail is valid.
    for (const user of userToSendMailTo) {
      mails.push(this.sendMail(user, smtpTransport, options));
    }

    const status = this.generateMailingStatus(await Promise.all(mails), users);

    smtpTransport.close();
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
    const options = this.getConfig();
    const smtpTransport = nodemailer.createTransport(options);

    const user = await this.userService.findById(userId);

    if (!user.temporaryPassword) {
      return { successFullSend: 0, failedMailsInfo: [{ userId: user.id }] };
    }

    const status = await this.sendMail(user, smtpTransport, options);

    smtpTransport.close();

    return this.generateMailingStatus([status], [user]);
  }

  private async sendMail(
    user: UserDocument,
    transport: Mail,
    options: TransportOptions
  ): Promise<MailingResponse> {
    try {
      return await transport.sendMail({
        from: this.getUser(),
        to: `${user.email}`,
        subject: 'Credentials',
        text: this.getTextOfMail(user, options),
        envelope: {
          to: `${user.email}`,
          ...options.envelope,
        },
      });
    } catch (err) {
      return new MailingError(user.id, err, 'Could not send mail.');
    }
  }

  private generateMailingStatus(mails: MailingResponse[], users: UserDocument[]): MailingStatus {
    const failedMailsInfo: FailedMail[] = [];
    let successFullSend: number = 0;

    for (const mail of mails) {
      if (mail instanceof MailingError) {
        const user = users.find(u => u.id === mail.userId) as UserDocument;

        failedMailsInfo.push({
          userId: user.id,
        });

        this.logger.error(`${mail.message} -- ${mail.err}`);
      } else {
        const previewURL = nodemailer.getTestMessageUrl(mail);

        if (previewURL) {
          this.logger.log(`Mail successfully send. Preview: ${previewURL}`);
        } else {
          this.logger.log('Mail successfully send.');
        }

        successFullSend++;
      }
    }

    return { successFullSend, failedMailsInfo };
  }

  private getTextOfMail(user: UserDocument, { templates }: TransportOptions): string {
    return templates.credentials
      .replace('{{name}}', `${user.firstname} ${user.lastname}`)
      .replace('{{username}}', user.username)
      .replace('{{password}}', user.temporaryPassword || '');
  }

  private getConfig(): TransportOptions {
    const options = config.get<TransportOptions>('mailing');

    if (options.testingMode) {
      const auth = options.auth as AuthenticationTypeLogin | undefined;

      if (!auth || !auth.user || !auth.pass) {
        throw new InvalidConfigurationException(
          'In testing mode an ethereal user & pass has to be supplied.'
        );
      }

      if (!auth.user.includes('ethereal')) {
        throw new InvalidConfigurationException(
          'In testing mode mailing user has to be an ethereal user.'
        );
      }

      return {
        templates: {
          credentials: options.templates.credentials,
        },
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: auth.user,
          pass: auth.pass,
        },
      };
    } else {
      this.assertValidConfig(options);

      return options;
    }
  }

  private getUser(): string {
    const options = this.getConfig();

    if (options.from) {
      if (typeof options.from === 'string') {
        return options.from;
      }

      if (options.from.address) {
        return options.from.address;
      }
    }

    if (options.auth && options.auth.user) {
      if (this.isValidEmail(options.auth.user)) {
        return options.auth.user;
      }
    }

    throw new InvalidConfigurationException(
      "Mailing must contain either a 'from' prop which contains an email address or the 'auth.user' must be a valid email address"
    );
  }

  private assertValidConfig(config: TransportOptions) {
    if (!config.templates) {
      throw new InvalidConfigurationException('No template settings were provided');
    }

    if (!config.templates.credentials) {
      throw new InvalidConfigurationException(
        'No template settings for the credentials mail were provided'
      );
    }

    if (!config.auth) {
      throw new InvalidConfigurationException('No authentication settings were provided');
    }

    if (this.isOAuth2(config.auth)) {
      const { user, clientId, clientSecret, refreshToken } = config.auth;

      if (!user || !clientId || !clientSecret || !refreshToken) {
        throw new InvalidConfigurationException(
          'user & clientId & clientSecret & refreshToken all have to be set in mailing auth options.'
        );
      }

      return;
    }

    if (this.isBasicAuth(config.auth)) {
      const { user, pass } = config.auth;

      if (!user || !pass) {
        throw new InvalidConfigurationException(
          'user && pass all have to be set in mailing auth options'
        );
      }

      return;
    }

    throw new InvalidConfigurationException(
      "Authentication type has to be 'OAuth2' or 'Login' (or undefined which defaults to 'Login')."
    );
  }

  private isOAuth2(auth: SMTPConnection.AuthenticationType): auth is AuthenticationTypeOAuth2 {
    return auth.type === 'oauth2' || auth.type === 'OAuth2' || auth.type === 'OAUTH2';
  }

  private isBasicAuth(auth: SMTPConnection.AuthenticationType): auth is AuthenticationTypeLogin {
    return !auth.type || auth.type === 'login' || auth.type === 'Login' || auth.type === 'LOGIN';
  }

  private isValidEmail(email: string): boolean {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  }
}
