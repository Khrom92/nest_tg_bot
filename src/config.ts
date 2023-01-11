import 'dotenv/config';

export const config = {
  api: {
    port: process.env.API_PORT || 3000,
  },
  bot: {
    token: process.env.BOT_TOKEN,
    url: process.env.URL_PUBLIC,
  },
  sheets: {
    link: process.env.SHEETS_LINK,
    gids: process.env.GIDS.split(', '),
  },
};
