/**
 * node.js server to accept the file posted
 */

var http = require('http')

var listeningPort = process.env.PORT || 8000
var server = http.createServer().listen(listeningPort);
server.on('request', onRequest)


console.log('SimpleUpload.js server: Listening on 0.0.0.0:'+listeningPort)


////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////


function onRequest(request, response){
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

/**
 * save data on the disk
 */
function save(basename, data){
        
        // var fullName = __dirname + '/../tmp/' + basename
        var fullName = __dirname + '/../../examples/vrExperiences/current/' + basename
        console.log('save', fullName)
        // console.log(data)
        // actually write the file
        require('fs').writeFile(fullName, data, function(err) {
                if(err) {
                        return console.log(err);
                }
        })        
}
