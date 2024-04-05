

const restify = require('restify');

var server = restify.createServer({
    name: 'pratica-1',
});

server.use(restify.plugins.bodyParser());

function helloWorld(req, res, next) {
    var name = 'Gabriel Costa - 1586';
    res.setHeader('Content-Type', 'application/json');
    res.charSet('UTF-8');
    res.send('Hello ' + name);
    next();
}

server.get('/api/v1/hello', helloWorld );

server.get('/', function(req, res, next) {
    var name = 'Gabriel Costa - 1586';
    res.setHeader('Content-Type', 'text/html');

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Minha API com restify.js</title>
        </head>
        <body>
            <h1>Página HTML de ${name}</h1>
            <p>Esta página é apenas um exemplo</p>
        </body>
        </html>
    `;

    res.write(html);
    res.end();
    next();
})

var port = process.env.PORT || 5000;
server.listen(port, function() {
    console.log('Servidor iniciado', server.name, ' na url http://localhost:' + port);
})
