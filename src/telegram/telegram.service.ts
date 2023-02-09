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
    // const regex = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+$/;
    if (/\d/.test(contractId)) {
      const res = this.sheetsService.getAppListByContractId(contractId);
      const issue = res?.contractInfo;
      const labels = res?.labels;
      console.log('issue: ', issue);

      if (!issue) {
        return [
          `Возможно, номер договора еще не был внесен в систему. Можете попробовать по позже либо, свяжитесь с нами: \nТелефон: +7 (921) 186-92-08; \nE-mail: lab@regionlab.pro`,
          undefined,
        ];
      } else {
        console.log(Object.keys(issue || {}));

        return [
          `Выберите ${labels[1]} для ${labels[0]} ${contractId}. Нет нужного? Возможно, номер заявки еще не был внесен в систему. Можете попробовать по позже либо, свяжитесь с нами: \nТелефон: +7 (921) 186-92-08; \nE-mail: lab@regionlab.pro`,
          {
            reply_markup: {
              inline_keyboard: Object.keys(issue || {}).map((idIssue) => [
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

        const issue = res?.contractInfo?.[idIssue];
        const labels = res?.labels;
        if (issue) {
          console.log(res?.contractInfo?.[idIssue]);

          responseText =
            `${labels[0]}: ${idAgree}, ${labels[1]}: ${idIssue} \n\n` +
            issue
              .map(({ dateOfIssue, sampleType }) => {
                let date = dateOfIssue
                  ? dateOfIssue
                  : 'Возможно, дата еще не определена, либо свяжитесь с нами для уточнения';

                if (dateOfIssue) {
                  const [day, month, year] = dateOfIssue
                    .split('.')
                    .map((item) => +item);
                  const newDate = new Date(year, month, day);
                  if (newDate.toDateString() !== 'Invalid Date') {
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
