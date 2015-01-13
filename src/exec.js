var clear = require('./clear')
var chalk = require('chalk')
var template = require('./template')
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
        var proc = [cmd, lesson.entry].join(' ')
        var child = spawn(proc)
        child.stderr.pipe(process.stderr)
        child.stdout.pipe(process.stdout)
    }
}