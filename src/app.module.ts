import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SheetsModule } from './sheets/sheets.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [TelegramModule, ScheduleModule.forRoot(), SheetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
