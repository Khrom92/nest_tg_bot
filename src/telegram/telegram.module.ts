import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { SheetsModule } from 'src/sheets/sheets.module';
import * as LocalSession from 'telegraf-session-local';
import { config } from '../config';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

const sessionStorage = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessionStorage.middleware()],
      token: config.bot.token,
    }),
    SheetsModule,
  ],
  providers: [TelegramUpdate, TelegramService],
})
export class TelegramModule {}

// TelegrafModule.forRootAsync({
//   imports: [TelegramController],
//   useFactory: () => ({
//     token: config.bot.token,
//     // launchOptions: {
//     //   webhook: {
//     //     domain: config.bot.url,
//     //     hookPath: `/bot${config.bot.token}`,
//     //   },
//     // },
//   }),
// }),
