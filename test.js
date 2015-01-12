var run = require('./')
var path = require('path')

//filter for accepting files
var accept = f => {
    return (f.indexOf('index') === 0 || /^[0-9]+/.test(f))
        && ['.js', '.es6'].indexOf(path.extname(f)) !== -1
}

//determine how to run the given lesson 
//can also return a function if we wanted a totally custom runner
function typemap(lesson) {
    if (lesson.dir === 'node')
        return 'node'
    if (lesson.dir === 'es6')
        return '6to5'
    return 'browserify'
}

run('test', {
    //we can specify a custom filter to only accept certain filenames
    accept: accept,
    //we can optionally strip comments from the printed code
    stripComments: true,
    //defaults to run node scripts, but we can specify what lessons 
    //should use browserify or 6to5
    runner: typemap
})
