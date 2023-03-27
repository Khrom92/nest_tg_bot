export type ProtocolMap = {
  [contractId: string]: {
    [appId: string]: {
      dateOfIssue: string;
      sampleType: string;
    }[];
  };
};

export type ContractWithLabels = {
  contractInfo: ProtocolMap[string];
  labels: [string, string];
  firstLineText: string;
};

export type TableRow = {
  '№ договора': string;
  Заказчик: string;
  '№ заявки': string;
  'Дата заявки': string;
  'Копия архив': string;
  'Тип пробы': string;
  'Прием по факту/дата сдачи': string;
  'Выдача протокола треб.': string;
  'Кто выдает': string;
  '№ протокола': string;
  'Выдача протокола факт.': string;
  'Кол-во проб (в протоколе)': string;
  'Кол-во проб (по факту)': string;
};
