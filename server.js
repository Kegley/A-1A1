var http = require('http');
var fs = require('fs');
var url = require('url');

var port = 8080;
var debug = false;
// Create a server
http.createServer( function (request, response) {
    // Parse the request containing file name
    var pathname = url.parse(request.url).pathname;

    // Print the name of the file for which request is made.
    if(debug) {
        console.log("Request for " + pathname + " received.");
    }
    // Read the requested file content from file system
    fs.readFile(pathname.substr(1), function (err, data) {
        if (err) {
            if(debug) console.log(err);
            // HTTP Status: 404 : NOT FOUND
            // Content Type: text/plain
            response.writeHead(404, {'Content-Type': 'text/html'});
        }else{
            //Page found
            // HTTP Status: 200 : OK
            // Find Content Type and send
            var dotoffset = request.url.lastIndexOf('.');
            var mimetype =
            dotoffset == -1? 'text/plain': {
                                    '.html' : 'text/html',
                                    '.ico' : 'image/x-icon',
                                    '.jpg' : 'image/jpeg',
                                    '.png' : 'image/png',
                                    '.gif' : 'image/gif',
                                    '.css' : 'text/css',
                                    '.js' : 'text/javascript'
                                    }[ request.url.substr(dotoffset) ];
            response.setHeader('Content-type' , mimetype);
            response.end(data);
            console.log( request.url, mimetype );



            //response.writeHead(200, {'Content-Type': mimetype});

            // Write the content of the file to response body
        }
        // Send the response body
        response.end();
    });
}).listen(port);

// Console will print the message
console.log('Server running at http://127.0.0.1:' + port);
