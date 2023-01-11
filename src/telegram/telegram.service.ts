import { Inject, Injectable } from '@nestjs/common';
import { defaultMessage } from './constants';
import { google } from 'googleapis';
import csv from 'csvtojson';
import { SheetsService } from 'src/sheets/sheets.service';
import { TelegramContext } from './types';

@Injectable()
export class TelegramService {
  constructor(
    @Inject(SheetsService) private readonly sheetsService: SheetsService,
  ) {}

  getStart(): string {
    return defaultMessage.start;
  }

  async getHelp(): Promise<string> {
    return defaultMessage.help;
  }

  async getContractList(contractId: string): Promise<[string, any]> {
    const regex = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+$/;
    if (contractId.match(regex)) {
      const res = await this.sheetsService.getAppListByContractId(contractId);
      if (!res) {
        return ['Нет данных по этому номеру договора', undefined];
      } else {
        return [
          `Выберите номер заявки для договора ${contractId}`,
          {
            reply_markup: {
              inline_keyboard: Object.keys(res || {}).map((idIssue) => [
                {
                  text: `Номер заявки - ${idIssue}`,
                  callback_data: `click|${contractId}|${idIssue}`,
                },
              ]),
            },
          },
        ];
      }
    } else {
      return ['Неверный формат', undefined];
    }
  }

  async getCallbackResp(data: string) {
    const [event, idAgree, idIssue] = data.split('|');
    let responseText =
      'К сожалению, данных пока нет, вы можете попробовать завтра или написать нам на почту  lab@regionlab.pro';
    try {
      if (event === 'click') {
        const res = await this.sheetsService.getAppListByContractId(idAgree);
        if (res?.[idIssue]) {
          console.log(res?.[idIssue]);

          responseText =
            `№ договора: ${idAgree}, № заявки: ${idIssue} \n\n` +
            res?.[idIssue]
              .map(
                ({ dateOfIssue, sampleType }) =>
                  `Дата выдачи протокола (${sampleType}): ${dateOfIssue}`,
              )
              .join('\n ---------------------------------------- \n');
        }
      }
    } catch (error) {
      console.log(error);
    }

    return responseText;
  }
}
