/**
 * Title: server libary 
 * Description: server realted file
 * Author: Nakib Uddin Ahmed
 * Data: 02/02/2022
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');

// server object - module scaffolding
const server = {};


// configuration
server.config = {
    port: 3000,
};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
        console.log(`listening to port ${server.config.port}`);
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () =>{
    server.createServer();
}


//expoort
module.exports = server
