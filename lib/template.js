var strip = require('strip-comments')
var chalk = require('chalk')
var fs = require('fs')

module.exports = function template(lesson, opt) {
    opt = opt||{}
    var marked = require('marked')
    var TerminalRenderer = require('marked-terminal')

    marked.setOptions({
        renderer: new TerminalRenderer()
    })

    var code = fs.readFileSync(lesson.entry, 'utf8')
    if (opt.stripComments)
        code = strip(code).trim()
    code = truncate(code, opt.truncate || 10)
    code = marked(['```js', code, '```'].join('\n'))
    var header = chalk.inverse(lesson.entry+'\n')
    header += chalk.dim(Array(lesson.entry.length+1).join('-')+'\n')
    return header + code
}

function truncate(text, n) {
    var lines = text.split('\n')
    lines = lines.filter(function(line) {
        return line.trim().length > 0
    })
    if (lines.length > n) {
        lines = lines.slice(0, n)
        lines.push('\n// ... (continued)')
    }
    return lines.join('\n')
}
