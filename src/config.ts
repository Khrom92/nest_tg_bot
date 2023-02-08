import 'dotenv/config';

export const config = {
  api: {
    port: process.env.PORT || 3000,
  },
  bot: {
    token: process.env.BOT_TOKEN,
    url: process.env.URL_PUBLIC,
  },
  sheets: {
    link: process.env.SHEETS_LINK,
    IN_WORK_GID: process.env.IN_WORK_GID,
    TT_IN_WORK_GID: process.env.TT_IN_WORK_GID,
  },
};
