import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { NotFoundExceptionFilter } from './filter/not-found-exception.filter';
import { isDevelopment } from './helpers/isDevelopment';
import { SettingsService } from './module/settings/settings.service';

/**
 * Sets up the security middleware.
 *
 * This function sets up the security middleware 'passport' and configures sessions.
 *
 * @param app The application itself
 */
function initSecurityMiddleware(app: INestApplication) {
    const logger = new Logger('Init security');
    logger.log('Setting up security middleware...');

    const settings = app.get(SettingsService);
    // const connectionSQL = app.get(MikroORM).em.getConnection();

    const secret = settings.getDatabaseConfiguration().secret;
    const timeoutSetting = settings.getSessionTimeout();

    logger.log(`Setting timeout to: ${timeoutSetting} minutes`);

    app.use(
        session({
            secret,
            // TODO: Add a custom store using Mikro-ORM (there is no actual usable library out there).
            // store: ,
            resave: false,
            // Is used to extend the expires date on every request. This means, maxAge is relative to the time of the last request of a user.
            rolling: true,
            saveUninitialized: true,
            cookie: {
                httpOnly: true,
                maxAge: timeoutSetting * 60 * 1000,
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    logger.log('Security middleware setup complete.');
}

/**
 * Sets up the Swagger documentation in development.
 *
 * If the server is started in a development environment this function will initialize the swagger documentation. This documentation will then be available at `{API_PREFIX}/docs` which all information that swagger can automatically create from the corresponding endpoints.
 *
 * If the server is __not__ started in a development environment (ie production) this endpoint is __not__ available and this function does nothing.
 *
 * @param app The application itself
 * @param apiPrefix Configured prefix of the api paths.
 */
function initSwagger(app: INestApplication, apiPrefix: string) {
    if (!isDevelopment()) {
        return;
    }

    const options = new DocumentBuilder()
        .setTitle('Tutor Management System API')
        .setDescription('{{description}}')
        .setVersion('2.0')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
}

export async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    const settings: SettingsService = app.get(SettingsService);

    Logger.log(`Setting API prefix to ${settings.getAPIPrefix()}`, 'App');
    app.setGlobalPrefix(settings.getAPIPrefix());

    // This filter enables serving an SPA from the given static folder.
    app.useGlobalFilters(new NotFoundExceptionFilter(settings));

    // Increase the limit of the build-in body-parser (from 100kb) so requests to parse "large" CSV-bodies don't fail (ie parsing the result CSV from a short test).
    app.use(bodyParser.json({ limit: '10mb' }));

    initSecurityMiddleware(app);
    initSwagger(app, settings.getAPIPrefix());

    await app.listen(8080);
}
