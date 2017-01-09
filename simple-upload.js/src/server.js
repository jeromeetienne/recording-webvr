/**
 * node.js server to accept the file posted
 */

var http = require('http')

var server = http.createServer().listen(8000);
server.on('request', handler)


console.log('Listening on 0.0.0.0:8000')
console.log('POST from browser')

function handler(request, response){
        var parsedUrl = require('url').parse(request.url)
        var parsedQuery = require('querystring').parse(parsedUrl.query)

        // if not a post, return now
        if (request.method !== 'POST') return

        var body = '';
        
        request.on('data', function (data) {
                body += data;
        });
        
        request.on('end', function () {
                // log to debug
                console.assert(parsedQuery.filename)
                console.log('save', parsedQuery.filename)

                // save data
                var data = JSON.parse(body)
                save(parsedQuery.filename, data)
                
                // allow CORS
                response.writeHead(200, {
                        'Access-Control-Allow-Origin' : '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
                });
                
                response.end();
        });
}

function save(basename, data){
        
        var fullName = __dirname + '/../tmp/' + basename
        console.log('save', fullName)
        // console.log(data)
        // actually write the file
        require('fs').writeFile(fullName, data, function(err) {
                if(err) {
                        return console.log(err);
                }
        })
        
}
