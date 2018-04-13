const winston = require('winston');
const moment = require('moment');
const tsFormat = () => moment().format('YYYY-MM-DD:HH:mm:ss').trim();
const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({'timestamp':tsFormat, colorize: true})
    ]
});
export default logger;
