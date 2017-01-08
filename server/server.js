var http = require('http')

var server = http.createServer().listen(8000);
server.on('request', handler)


function handler(request, response){
    if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
                var parsedUrl = require('url').parse(request.url)
                var parsedQuery = require('querystring').parse(parsedUrl.query)
                var data = JSON.parse(body)
                console.dir(parsedQuery)
                console.assert(parsedQuery.vrExperienceName)
                console.assert(parsedQuery.filename)
                
                console.log('save', parsedQuery.filename)
        });
    }
}
