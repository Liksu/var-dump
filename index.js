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

var currentFile4Log = {};
var config = {
    silence: false,
    filename: false,
    grepper: null,
    space: '  '
};

function log() {
    var params = [];
    var arg = arguments;
    try { throw new Error() } catch(e) {
        var stackLines = e.stack.split('\n');
        var pos = stackLines[2].match(/\((.+?):(\d+):(\d+)\)/); // file:string:column
        if (!currentFile4Log[pos[1]]) currentFile4Log[pos[1]] = require('fs').readFileSync(pos[1]).toString().split(/\n/);
        params = currentFile4Log[pos[1]][pos[2] - 1].substr(pos[3] - 1).match(/.+?\((.*?)\)/)[1].split(/\s*,\s*/);
    }

    params = params.reduce(function(result, param, i) {
        if (i >= arg.length) return result;
        return /^['"]/.test(param) || /^[\d.]+$/.test(param) || /^[{\[]/.test(param)
            ? result.concat(chalk.blue( typeof arg[i] === 'object' ? JSON.stringify(arg[i], null, config.space) : arg[i] ))
            : result.concat(chalk.blue(param) + ' = ' + chalk.yellow(JSON.stringify(arg[i], null, config.space)));
    }, []);

    var result = [params.join(', ')];
    if (config.filename) result.unshift(chalk.gray('[' + pos[1].replace(/^.+[/\\]([^/\\]+)$/, '$1') + ':' + pos[2] + ']'));
    if (config.grepper) result.unshift(config.grepper);

    if (!config.silence) console.log.apply(console, result);
}

module.exports = function(settings) {
    if (settings) config = extend(config, settings);
    return log;
};