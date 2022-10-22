import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TemplateService } from './template.service';

@Module({
    providers: [TemplateService],
    exports: [TemplateService],
})
export class TemplateModule implements OnApplicationBootstrap {
    constructor(private readonly templateService: TemplateService) {}

    onApplicationBootstrap(): void {
        this.templateService.checkAllTemplatesPresent();
    }
}
