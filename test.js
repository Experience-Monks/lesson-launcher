var run = require('./')
var path = require('path')

//some default launchers
//actual require will look like this:
//  require('lesson-launcher/browserify')
var es5 = require('./exec')('node')
var es6 = require('./exec')('./node_modules/.bin/6to5-node')
var browserify = require('./browserify')

//filter for accepting files
var accept = f => {
    return (f.indexOf('index') === 0 || /^[0-9]+/.test(f))
        && ['.js', '.es6'].indexOf(path.extname(f)) !== -1
}

//determine how to run the given lesson 
//can also return a function if we wanted a totally custom runner
function runner(lesson, opt) {
    var func = es5
    if (lesson.dir === 'es6')
        func = es6
    else if (lesson.dir === 'browser')
        func = browserify
    func(lesson, opt)
}

run('test', {
    //we can specify a custom filter to only accept certain filenames
    accept: accept,
    //we can optionally strip comments from the printed code
    stripComments: true,
    //defaults to run node scripts, but we can specify what lessons 
    //should use browserify or 6to5
    runner: runner
})
