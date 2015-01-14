# lesson-launcher

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

![screen](http://i.imgur.com/Wj4apmK.png)

An interactive terminal to browse and launch JavaScript files in a particular environment. By default, uses `node` for all scripts, but this can be overridden to run es6 files or launch a browser for DOM/WebGL examples. 

Currently only works with a single depth in folder structure, which typically looks like this:

```
lessons
    streams
        01.js
        02.js
        README.md
    foobar
        01.js
        foo.js
        README.md
    dom
        01.js
        README.md
```

See [test.js](test.js) for example. Note that this module is highly experimental and subject to change.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/lesson-launcher/blob/master/LICENSE.md) for details.
