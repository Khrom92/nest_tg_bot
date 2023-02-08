import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SheetsRepository } from './sheets.repository';

@Injectable()
export class SheetsService {
  constructor(private readonly sheetsRepository: SheetsRepository) {
    // this.init();
  }

  public async init() {
    await this.sheetsRepository.updateTable();
    console.log(' init Table ');
  }

  public getAppListByContractId(contractId: string) {
    return this.sheetsRepository.getByContractId(contractId);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateTable() {
    await this.sheetsRepository.updateTable();
    console.log('Table updated by cron');
  }
}
