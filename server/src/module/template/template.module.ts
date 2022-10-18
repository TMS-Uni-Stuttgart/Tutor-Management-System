import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TemplateService } from './template.service';

@Module({
    providers: [TemplateService],
    exports: [TemplateService],
})
export class TemplateModule implements OnApplicationBootstrap {
    constructor(private readonly templateService: TemplateService, private readonly orm: MikroORM) {}

    onApplicationBootstrap(): void {
        this.templateService.checkAllTemplatesPresent();
    }
}
