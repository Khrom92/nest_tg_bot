import { Context } from 'telegraf';

interface TelegramCallbackQuery {
  data: string;
  id: string;
}

interface TelegramMessage {
  text: string;
}

export type TelegramContext = Context & {
  message: TelegramMessage;
  callbackQuery: TelegramCallbackQuery;
};
