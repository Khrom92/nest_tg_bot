import { Module } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { SheetsRepository } from './sheets.repository';

@Module({
  providers: [SheetsRepository, SheetsService],
  exports: [SheetsService],
})
export class SheetsModule {
  constructor(private readonly sheetsService: SheetsService) {
    this.sheetsService.init();
  }
}
