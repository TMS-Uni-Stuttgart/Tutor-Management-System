import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { LocalesService, MissingKeyContainer } from './locales.service';

@Controller('locales')
export class LocalesController {
    constructor(private readonly localesService: LocalesService) {}

    @Post('/:lang/:namespace')
    @UseGuards(AuthenticatedGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async markMissingLocaleKey(
        @Param('lang') lang: string,
        @Param('namespace') namespace: string,
        @Body() missingKeys: Record<string, string>
    ): Promise<void> {
        const container = new MissingKeyContainer(missingKeys);
        this.localesService.addMissingLanguageKey({ lang, namespace, container });
    }
}
