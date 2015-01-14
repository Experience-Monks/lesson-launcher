var clear = require('./lib/clear')
var template = require('./lib/template')
var chalk = require('chalk')

module.exports = function browserify(lesson, opt) {
    require('./lib/serve')({ 
        entries: [ lesson.entry ] 
    }, (err, result) => {
        if (err) {
            console.error('could not start', err)
            process.exit(1)
        } else {
            var url = `http://localhost:${result.port}/`
            var file = chalk.bold(lesson.file)
            clear()
            console.log(template(lesson, opt))
            console.log()
            console.log(chalk.bgWhite(`running ${file} on ${url}`))
            
            // allow input
            stdin(url)
        }
    })
}

function stdin(url) {
    var cmds = ['open', 'o']
    var styled = cmds.map( x => chalk.bgWhite(x) )
    var ops = styled.join(' or ')

    console.log(chalk.dim(`enter ${ops} to open in browser`))
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', function (data) {
        data = (data + '').trim().toLowerCase()
        
        if (cmds.indexOf(data) !== -1) {
            require('open')(url)
        }
    });
}