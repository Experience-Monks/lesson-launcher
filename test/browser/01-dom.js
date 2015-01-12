var context = draw(require('webgl-context')({
    width: 256,
    height: 256
}))

require('domready')(function() {
    document.body.appendChild(context.canvas)
})

function draw(gl) {
    var bg = require('gl-vignette-background')(gl)
    bg.draw()
    return gl
}