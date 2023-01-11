import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function actionButtons(): Markup.Markup<InlineKeyboardMarkup> {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('📝 Add', 'add'),
      Markup.button.callback('📖 List', 'list'),
      Markup.button.callback('📊 Stats', 'stats'),
    ],
    {
      columns: 3,
    },
  );
}
