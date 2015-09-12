/**
 * @example
 * var dump = require('var-dump')({silence: !argv.debug});
 * dump(foo);
 *
 * // equal to
 * if (argv.debug) console.log('foo = ', foo);
 */

var extend = require('util')._extend;
var chalk = require('chalk');

var currentFile4Log = null;
var config = {
    silence: false
};

function log() {
    var params = [];
    var arg = arguments;
    try { throw new Error() } catch(e) {
        var stackLines = e.stack.split('\n');
        var pos = stackLines[2].match(/\((.+?):(\d+):(\d+)\)/); // file:string:column
        if (!currentFile4Log) currentFile4Log = require('fs').readFileSync(pos[1]).toString().split(/\n/);
        params = currentFile4Log[pos[2] - 1].substr(pos[3] - 1).match(/.+?\((.*?)\)/)[1].split(/\s*,\s*/);
    }

    params = params.reduce(function(result, param, i) {
        return /^['"]/.test(param) || /^[\d.]+$/.test(param) || /^[{\[]/.test(param)
            ? result.concat(chalk.blue(param))
            : result.concat(chalk.blue(param) + ' = ' + chalk.yellow(JSON.stringify(arg[i])));
    }, []);

    if (!config.silence) console.log(params.join(', '));
}

module.exports = function(settings) {
    if (settings) config = extend(config, settings);
    return log;
};