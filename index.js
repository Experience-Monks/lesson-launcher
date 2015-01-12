var Menu = require('terminal-menu')

var fs = require('fs')
var path = require('path')
var walk = require('walk').walkSync
var xtend = require('xtend')
var chalk = require('chalk')
// var argv = require('minimist')(process.argv.slice(2));
var spawn = require('npm-execspawn')
var noop = function() {}
var strip = require('strip-comments')

module.exports = function entry(folder, opt) {
    start(walkdir(folder, opt), opt)
}

function start(lessons, opt) {
    if (lessons.dirs.length === 0) {
        console.log(chalk.red("No files to launch!"))
        process.exit(0)
    }

    //choose a directory
    choose({
        items: lessons.dirs,
        title: 'CHOOSE A LESSON'
    }, function(dir) {
        var filtered = lessons.files.filter(x => dir === x.dir)
        var names = filtered.map(x => x.file)

        //choose a file
        choose({ 
            title: dir,
            items: names, 
            back: start.bind(null, lessons) 
        }, function(file, idx) {
            var lesson = filtered[idx]
            run(lesson, opt)
        })
    })
}

function choose(opt, cb) {
    cb = cb||noop

    opt = xtend({ items: [] }, opt)

    var title = opt.title || ''

    var menu = Menu({ width: 29,  x: 4, y: 2, bg: 'blue', fg: 'white' })
    menu.reset()
    menu.write(title+'\n')
    menu.write('---------------\n')
    if (opt.back)
        menu.add('../')

    opt.items.forEach(dir => menu.add(dir))
    menu.once('select', () => { 
        menu.close() 
    })
    menu.once('select', (label, index) => {
        //if we hit back, don't call the success function
        if (label === '../')
            cb = opt.back || noop
        cb(label, opt.items.indexOf(label))
    })

    menu.createStream().pipe(process.stdout)
}

//default typemap is to just run in node
function typemap(lesson) {
    return 'node'
}

function run(lesson, opt) {
    opt = opt||{}
    var getType = opt.runner || typemap
    var type = getType(lesson)
    
    var func
    if (type === 'browserify')
        func = browserify
    else if (type === '6to5')
        func = exec('./node_modules/.bin/6to5-node')
    else if (typeof type === 'function')
        func = type
    else
        func = exec('node')

    func(lesson, opt)
}

function exec(cmd) {
    return function (lesson, opt) {
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

function browserify(lesson, opt) {
    require('./serve')({ 
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

function walkdir(folder, opt) {
    opt = opt||{}

    var files = []

    //filter for accepting files
    var accept = opt.accept || f => {
        return ['.js', '.es6'].indexOf(path.extname(f)) !== -1
    }

    //needs to be sync for terminal-menu
    walk(folder, {
        listeners: { 
            file: function(root, stat, next) {
                var dir = path.basename(root)
                var file = path.basename(stat.name, path.extname(stat.name))
                if (accept(stat.name)) {
                    files.push(xtend(stat, { 
                        file: file, 
                        entry: path.join(root, stat.name),
                        dir: dir 
                    }))
                }
                next()
            }
        }
    })
    //list of directory names that contain lessons
    var dirs = files.map(x => x.dir)
        .filter((x, i, self) => self.indexOf(x) === i) //uniques only
    return {
        dirs: dirs,
        files: files
    }
}

function clear() {
    process.stdout.write("\u001b[2J\u001b[0;0H")
}

function template(lesson, opt) {
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