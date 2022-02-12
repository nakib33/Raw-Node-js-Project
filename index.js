/**
 * Title: Project initial file
 * Description: initial file to start the node server and workers
 * Author: Nakib Uddin Ahmed
 * Data: 02/02/2022 && 10/02/2022
 */

// dependencies
/*const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environment.js');
const data = require('./lib/data');
//const { sendTwilioSms } =require('./helpers/notification');*/



//todos remove letter
/*sendTwilioSms('01719230676', 'Hello World', (err) =>{
    console.log(`This is the error`, err);
});*/

//testing file system
//@TODO: pore muse dibo
//create
/*data.create('test', 'newFile', {'name': 'Sayeda Rownak', 'work': 'Maleup artist'}, (err) =>{
    console.log(`error was`, err);
});
*/
//read
/*data.read('test', 'newFile',  (err, data) =>{
    console.log(err, data);
});*/

//update
/*data.update('test', 'newFile', {'name': 'Nakib Uddin Ahmed', 'work': 'Engineer'}, (err) =>{
    console.log(err);
});
*/

//delete
/*data.delete('test', 'newFile',  (err) =>{
    console.log(err);
});*/

// configuration
/*app.config = {
    port: 3000,
};
*/
// create server
/*app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`listening to port ${app.config.port}`);
    });
};

// handle Request Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();*/

// dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

// app object - module scaffolding
const app = {};

app.init = () =>{
    //start the server
    server.init();
    //start the workers(backend)
    workers.init();
}

app.init();

//export the app
module.exports = app;