import { Inject, Injectable } from '@nestjs/common';
import { defaultMessage } from './constants';
import { SheetsService } from 'src/sheets/sheets.service';

@Injectable()
export class TelegramService {
  constructor(
    @Inject(SheetsService) private readonly sheetsService: SheetsService,
  ) { }

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
        return [
          `Возможно, номер договора еще не был внесен в систему. Можете попробовать по позже либо, свяжитесь с нами: \nТелефон: +7 (921) 186-92-08; \nE-mail: lab@regionlab.pro`,
          undefined,
        ];
      } else {
        return [
          `Выберите номер заявки для договора ${contractId}.Нет нужного? Возможно, номер заявки еще не был внесен в систему. Можете попробовать по позже либо, свяжитесь с нами: \nТелефон: +7 (921) 186-92-08; \nE-mail: lab@regionlab.pro`,
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
      return [
        'Проверьте пожалуйста правильность введенного формата номера договора (пример: 147-22)',
        undefined,
      ];
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
              .map(({ dateOfIssue, sampleType }) => {
                let date =
                  'Возможно, дата еще не определена, либо свяжитесь с нами для уточнения';

                if (dateOfIssue) {
                  // const [day, month, year] = dateOfIssue
                  //   .split('.')
                  //   .map((item) => +item);
                  const newDate = new Date(dateOfIssue);
                  newDate.setDate(newDate.getDate() + 1);

                  if (newDate.getDay() === 6) {
                    newDate.setDate(newDate.getDate() + 2);
                  }

                  if (newDate.getDay() === 7) {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  date = newDate.toLocaleString('ru', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  });
                }
                return `Дата выдачи протокола (${sampleType}): ${date}`;
              })
              .join('\n ---------------------------------------- \n');
        }
      }
    } catch (error) {
      console.log(error);
    }

    return responseText;
  }
}
