import { Controller, Get, Render, Post, Body } from '@nestjs/common';
import { google } from 'googleapis';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }

  @Post()
  async submit(@Body() body) {
    const { request, name } = body;

    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1guKsYBeY9UHpiVP2ysODpcFTXF0f6Ja7';

    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Sheet1!A:A',
    });

    // Write row(s) to spreadsheet
    // googleSheets.spreadsheets.values.append({
    //   auth,
    //   spreadsheetId,
    //   range: 'Sheet1!A:B',
    //   valueInputOption: 'USER_ENTERED',
    //   resource: {
    //     values: [[request, name]],
    //   },
    // });

    return 'Successfully submitted! Thank you!';
  }
}
