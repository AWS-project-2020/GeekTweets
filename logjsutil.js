
var log4js = require('log4js');
log4js.configure({
    appenders: [
        {type: 'console'},
        {type: 'file', filename: 'logs/access.log', category: 'normal'}

    ]
});

exports.logger = function () {
    var logger = log4js.getLogger('normal')
    logger.setLevel('INFO');
    return logger;
}

exports.log4js=log4js;
