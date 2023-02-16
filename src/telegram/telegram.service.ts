import { Inject, Injectable } from '@nestjs/common';
import { defaultMessage } from './constants';
import { SheetsService } from 'src/sheets/sheets.service';
import { addDays, getDay, format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';

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

                let newDate = parse(dateOfIssue, 'dd.MM.yyyy', new Date());
                if (newDate.toDateString() !== 'Invalid Date') {
                  newDate = addDays(newDate, 1);

                  if (getDay(newDate) === 6) {
                    newDate = addDays(newDate, 2);
                  }

                  if (getDay(newDate) === 0) {
                    newDate = addDays(newDate, 1);
                  }

                  date = format(newDate, 'EEEE, d MMMM yyyy', {
                    locale: ru,
                  });
                }

                return `Дата выдачи протокола (${sampleType}): <b>${date}</b>`;
              })
              .join('\n                             \n');
        }
      }
    } catch (error) {
      console.log(error);
    }

    return responseText;
  }
}
