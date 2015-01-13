var clear = require('./lib/clear')
var chalk = require('chalk')
var template = require('./lib/template')
var spawn = require('npm-execspawn')

module.exports = function(cmd) {
    return function exec(lesson, opt) {
        //clear console
        clear()

        //show the source code & info
        console.log(template(lesson, opt))

        console.log(chalk.inverse('output'))
        console.log(chalk.dim('---------------------'))

        //spawn command
        var child = spawn(`${cmd} ${lesson.entry}`)
        child.stderr.pipe(process.stderr)
        child.stdout.pipe(process.stdout)
    }
}