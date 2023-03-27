import { Injectable } from '@nestjs/common';
import * as csvtojson from 'csvtojson';
import fetch from 'node-fetch';
import { config } from '../config';

import type { TableRow, ProtocolMap, ContractWithLabels } from './types';

const link = config.sheets.link;
const IN_WORK_GID = config.sheets.IN_WORK_GID;
const TT_IN_WORK_GID = config.sheets.TT_IN_WORK_GID;

@Injectable()
export class SheetsRepository {
  protocolMapInWork: ProtocolMap = {};
  protocolMapTTinWork: ProtocolMap = {};

  public getByContractId(contractId: string): ContractWithLabels | null {
    if (this.protocolMapInWork[contractId]) {
      return {
        contractInfo: this.protocolMapInWork[contractId],
        labels: ['№ договора ', '№ заявки'],
        firstLineText: 'Выберите номер заявки для договора №',
      };
    }
    if (this.protocolMapTTinWork[contractId]) {
      return {
        contractInfo: this.protocolMapTTinWork[contractId],
        labels: ['№ заявки', '№ заказа'],
        firstLineText: 'Выберите номер заказа для заявки №',
      };
    }
    return null;
  }

  private getTable(gid: string): Promise<TableRow[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${link}&gid=${gid}`);
        const data = await response.text();

        const result: TableRow[] = await csvtojson().fromString(data);
        console.log('result: ', result[0]);

        resolve(result);
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

  private formatTableInWork(table: TableRow[]): ProtocolMap {
    const protocolMap: ProtocolMap = {};
    let contractId: string | null = null;
    let appId: string | null = null;

    table.forEach((row) => {
      contractId = row['№ договора'] ? row['№ договора'] : contractId;
      appId = row['№ заявки'] ? row['№ заявки'] : appId;

      protocolMap[contractId] = {
        ...(protocolMap?.[contractId] || {}),
        [appId]: [
          ...(protocolMap?.[contractId]?.[appId] || []),
          {
            dateOfIssue: row['Анализ ДО вкл-но'] || null,
            sampleType: row['Тип пробы'],
          },
        ],
      };
    });

    return protocolMap;
  }

  private formatTableTTInWork(table: TableRow[]): ProtocolMap {
    const protocolMap: ProtocolMap = {};
    let contractId: string | null = null;
    let appId: string | null = null;

    table.forEach((row) => {
      contractId = row['№ заявки'] ? row['№ заявки'] : contractId;
      appId = row['№ заказа'] ? row['№ заказа'] : appId;

      protocolMap[contractId] = {
        ...(protocolMap?.[contractId] || {}),
        [appId]: [
          ...(protocolMap?.[contractId]?.[appId] || []),
          {
            dateOfIssue: row['Анализ ДО вкл-но'] || null,
            sampleType: row['Тип пробы'],
          },
        ],
      };
    });

    return protocolMap;
  }

  public async updateTable(): Promise<void> {
    console.log('Updating table...');

    const tableInWork = await this.getTable(IN_WORK_GID);
    const formattedTableInWork = this.formatTableInWork(tableInWork);

    const tableTTinWork = await this.getTable(TT_IN_WORK_GID);
    const formattedTableTTInWork = this.formatTableTTInWork(tableTTinWork);
    // console.log('formattedTableTTInWork: ', formattedTableTTInWork);

    this.protocolMapInWork = { ...formattedTableInWork };
    this.protocolMapTTinWork = { ...formattedTableTTInWork };
  }
}
