var Menu = require('terminal-menu')

var fs = require('fs')
var path = require('path')
var walk = require('walk').walkSync
var xtend = require('xtend')
var chalk = require('chalk')

var execScript = require('./exec')('node')
var noop = function() {}

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

function defaultRunner(lesson) {
    return execScript
}

function run(lesson, opt) {
    var func = (opt && opt.runner) || execScript
    func(lesson, opt)
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