import config from 'config';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class MailService {
  public async mailCredentials() {
    const config = this.getConfig();

    if (!config.service) {
      return Promise.reject('No service was provided.');
    }

    if (!config.auth) {
      return Promise.reject('No authentication settings were provided');
    }

    if (
      config.auth.type !== 'oauth2' &&
      config.auth.type !== 'OAuth2' &&
      config.auth.type !== 'OAUTH2'
    ) {
      // TODO: Support 'login' as well.
      return Promise.reject('Authentication type has to be OAuth2.');
    }

    const { user, clientId, clientSecret, refreshToken } = config.auth;

    if (!user || !clientId || !clientSecret || !refreshToken) {
      return Promise.reject('user & clientId & clientSecret & refreshToken all have to be set.');
    }

    const smtpTransport = nodemailer.createTransport(config);

    await smtpTransport.sendMail({
      from: user,
      to: 'RECEIVER',
      subject: 'Test message',
      text: 'This is a test message to test nodemailer.',
    });
  }

  private getConfig() {
    return config.get<SMTPTransport.Options>('mailing');
  }
}

const mailService = new MailService();

export default mailService;
