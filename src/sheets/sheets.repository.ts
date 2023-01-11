import { Injectable } from '@nestjs/common';
import * as csvtojson from 'csvtojson';
import fetch from 'node-fetch';
import { config } from '../config';

import type { TableRow, ProtocolMap } from './types';

const link = config.sheets.link;
const gids = config.sheets.gids;

console.log(gids);

@Injectable()
export class SheetsRepository {
  protocolMap: ProtocolMap = {};

  public async getByContractId(
    contractId: string,
  ): Promise<ProtocolMap[string] | null> {
    return this.protocolMap[contractId] || null;
  }

  public getProtocolMap(): ProtocolMap {
    return this.protocolMap;
  }

  public async updateTable(): Promise<void> {
    const protocolTables = await Promise.all(
      gids.map(async (gid) => {
        try {
          const response = await fetch(`${link}&gid=${gid}`);
          const data = await response.text();

          const result: TableRow[] = await csvtojson().fromString(data);

          return result;
        } catch (e) {
          console.log(e);
          return [];
        }
      }),
    );

    const protocolMap: ProtocolMap = {};
    let contractId: string | null = null;
    let appId: string | null = null;

    protocolTables.flat().forEach((row) => {
      contractId = row['№ договора'] ? row['№ договора'] : contractId;
      appId = row['№ заявки'] ? row['№ заявки'] : appId;

      protocolMap[contractId] = {
        ...(protocolMap?.[contractId] || {}),
        [appId]: [
          ...(protocolMap?.[contractId]?.[appId] || []),
          {
            dateOfIssue: row['Выдача протокола факт.'] || 'Не известно',
            sampleType: row['Тип пробы'],
          },
        ],
      };
    });

    this.protocolMap = protocolMap;
  }
}
