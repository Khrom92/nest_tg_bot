import { Update, Ctx, Start, Help, On } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';

import { Context } from 'telegraf';
import { TelegramContext } from './types';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) { }

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(this.telegramService.getStart());
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply(await this.telegramService.getHelp());
  }

  @On('sticker')
  async on(@Ctx() ctx: Context) {
    await ctx.reply('👍');
  }

  @On('text')
  async hears(@Ctx() ctx: TelegramContext) {
    try {
      const [text, options] = await this.telegramService.getContractList(
        ctx.message.text,
      );
      await ctx.reply(text, options);
    } catch (error) {
      console.log(error);
      await ctx.reply('Что-то пошло не так, попробуйте еще раз');
    }
  }

  @On('callback_query')
  async add(@Ctx() ctx: TelegramContext) {
    if (ctx.callbackQuery?.data) {
      await ctx.reply(
        await this.telegramService.getCallbackResp(ctx.callbackQuery?.data),
        { parse_mode: 'HTML' },
      );
    }
  }
}
