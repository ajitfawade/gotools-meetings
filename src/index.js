import { Logger } from './config/logger';
import { keys } from './config/keys';
import { startServer } from './start';
Logger.init({ level: 'debug' });
startServer({ port: keys.port });
