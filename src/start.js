import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import passport from 'passport';                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
import HttpStatus from 'http-status-codes';
import { errors, isCelebrate } from 'celebrate';

// this is all it takes to enable async/await for express middleware
import 'express-async-errors';

import { Logger } from './config/logger';
import Response from './utils/Response';

// all the routes for app are retrieved from the src/routes/index.js module
import { getRoutes } from './routes';
import { keys } from './config/keys';

const isProduction = process.env.NODE_ENV === 'production';

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

function startServer({ port = process.env.PORT } = {}) {
  const app = express();

  // Bodyparser middleware
  app.use(
    bodyParser.urlencoded({
      extended: false,
    }),
  );
  app.use(bodyParser.json());

  // initialize winston logger for replacing console logs
  Logger.init({ level: 'info' });

  // use morgan for access logs

  app.use(isProduction ? morgan('combined') : morgan('dev'));

  // Connect to MongoDB
  if (!isProduction) mongoose.set('debug', true);
  mongoose
    .connect(keys.mongoURI)
    .then(() => Logger.log('info', 'MongoDB successfully connected'))
    .catch((err) => Logger.log('error', 'Unable to connect to mongodb server', err));

  // Passport middleware
  /*   app.use(passport.initialize());

  // Passport config
  require('../config/passport')(passport); */

  // mount entire app to the /api route (or you could just do "/" if you want)
  app.use('/api', getRoutes());

  if (isProduction) {
    app.use(express.static('client/build'));

    // Express serve up index.html file if it doesn't recognize route
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }

  // handle errors from 'celebrate'
  app.use(errors());

  // add the generic error handler just in case errors are missed by middleware
  app.use(errorMiddleware);
  // prefer dealing with promises. It makes testing easier, among other things.
  // So this block of code allows us to start the express app and resolve the
  // promise with the express server
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      Logger.log('info', `Listening on port ${server.address().port}`);
      // this block of code turns `server.close` into a promise API
      const originalClose = server.close.bind(server);
      server.close = () => {
        return new Promise((resolveClose) => {
          originalClose(resolveClose);
        });
      };
      // this ensures that we properly close the server when the program exists
      setupCloseOnExit(server);
      // resolve the whole promise with the express server
      resolve(server);
    });
  });
}
// here's our generic error handler for situations where we didn't handle
// errors properly
function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    console.log('headers sent');
    next(error);                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  } else if (isCelebrate(err)) {
    console.log('celebrate error');
    return Response.fail(
      res,
      'Validation Failed',
      HttpStatus.UNPROCESSABLE_ENTITY,
      HttpStatus.UNPROCESSABLE_ENTITY,
      err.details,
    );
  } else {
    Logger.log('error', 'Error', error);
    return Response.fail(
      res,
      error.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      // we only add a `stack` property in non-production environments
      ...(isProduction ? null : { stack: error.stack }),
    );
  }
}
// ensures we close the server in the event of an error.
function setupCloseOnExit(server) {
  async function exitHandler(options = {}) {
    await server
      .close()
      .then(() => {
        Logger.log('info', 'Server successfully closed');
      })
      .catch((e) => {
        Logger.warn('Something went wrong closing the server', e.stack);
      });
    if (options.exit) process.exit();
  }
  // do something when app is closing
  process.on('exit', exitHandler);
  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}
export { startServer };
