# Paper.js Starter Kit

This Paper.js starter kit is set up to facilitate the deployment of scripts that
were developed on [sketch.paperjs.org](http://sketch.paperjs.org)

It includes the following dependencies with are also present on sketch:

* [Acorn.js](https://github.com/acornjs/acorn) for support of modern-day
  JavaScript syntax in PaperScript scripts.
* [Palette.js](https://github.com/lehni/palette.js) for the creation of very
  simple GUI palettes that interract easily with the script, along with some
  basic styling for them.

Due to the CORS restrictions, the PaperScript file `script.js` cannot be loaded
by `index.html` when serving the page from the local file-system. To get around
this restrictions, you need to run a simple web-server from the starter kit
directory:

```sh
 python -m SimpleHTTPServer
```

After that, you can view the site by visiting
[localhost:8000](http://localhost:8000/) in your browser.
