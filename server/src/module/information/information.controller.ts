import { Controller, Get } from '@nestjs/common';
import { InformationService } from './information.service';

@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Get('/version')
  async getVersion(): Promise<string> {
    return this.informationService.getVersion();
  }
}
