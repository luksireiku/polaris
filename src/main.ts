import http from 'http';
import { Bot, Config, Database } from '.';
import { catchException, logger } from './utils';

const bots: Bot[] = [];

export async function stop(): Promise<void> {
  let pending = bots.length;
  logger.info(`Stopping ${pending} bots...`);
  for (const bot of bots) {
    try {
      await bot.stop();
    } catch (e) {
      logger.error(e.message);
    }

    pending -= 1;
    if (pending == 0) {
      logger.info(`Closed all bots, exiting process. PID: ${process.pid}`);
      process.exit();
    } else {
      logger.info(`Pending ${pending} bots...`);
    }
  }
}

process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());

http
  .createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    logger.info(`request received at: ${req.url}`);
    req.on('data', (chunk) => {
      logger.info(JSON.stringify(chunk));
    });
    res.end();
  })
  .listen(1984);

export const db = new Database();
db.events.on('update:configs', async () => {
  logger.info('Configs updated');
  if (Array.isArray(bots) && bots.length > 0) {
    for (const bot of bots) {
      await bot.stop();
    }
  }
  for (const key of Object.keys(db.configs)) {
    const configs = Config.loadInstancesFromJSON(db.configs[key]);
    for (const config of configs) {
      const bot = new Bot(config);
      if (config.enabled) {
        process.on('unhandledRejection', (exception: Error) => {
          catchException(exception, bot);
        });
        await bot.start();
      }
      bots.push(bot);
    }
  }
});
db.init();
