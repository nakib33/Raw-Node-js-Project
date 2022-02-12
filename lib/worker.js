/**
 * Title: worker libary 
 * Description: worker realted file
 * Author: Nakib Uddin Ahmed
 * Data: 02/02/2022
 */

// dependencies
const url = require('url');
const data = require('./data');
const http = require('http');
const https = require('https');
const { parse } = require('path');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notification');

// server object - module scaffolding
const worker = {};

//worker -> lookup all check in the datbase
worker.gatherAllChecks = () =>{
    //get all the checks
    data.list('checks', (err, checks)=>{
        if(!err && checks && checks.length > 0){
            checks.forEach(check=> {
                //read the checkData
                data.read('checks', check, (err2, originalCHecksData)=>{
                    if(!err2 && originalCHecksData){
                        //pass the data to the next process(check the validator here)
                        worker.validateCheckData(parseJSON(originalCHecksData));
                    }else{
                        console.log('Error: reading one of the checks data!');
                    }
                })
            });
        }else{
            console.log('Error: could not find any checks tp process!');
        }
    });
};


//perform Check 
worker.performCheck = (originalCHecksData)=> {
    //prepare the initial check out come
    let checkOutCome = {
        'error': false,
        'response': false
    };
    //mark the outcome has not been sent yet
    let outComeSent = false;
    //parse the hostname & full url  from original data
    const parseUrl = url.parse(`${originalCHecksData.protocol}://${originalCHecksData.url}`, true);
    const hostName = parseUrl.hostname;
    const path = parseUrl.path;

    //construct the request
    const requestDetails = {
        'protocol': originalCHecksData.protocol+ ':',
        'hostname': hostName,
        'method': originalCHecksData.method.toUpperCase(),
        'path': path,
        'timeout': originalCHecksData.timeoutSeconds * 1000
    };

    const protocolToUse = originalCHecksData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) =>{
        //get the status of the request
        const status = res.statusCode;

        //update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if(!outComeSent){
            worker.processCheckOutCome(originalCHecksData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('error',(e)=>{
        checkOutCome = {
            'error': true,
            'value': e,
        };
        //update the check outcome and pass to the next process
        if(!outComeSent){
            worker.processCheckOutCome(originalCHecksData, checkOutCome);
            outComeSent = true;
        }
    });

    req.on('timeout',(e)=>{
        checkOutCome = {
            'error': true,
            'value': 'timeout',
        };
        //update the check outcome and pass to the next process
        if(!outComeSent){
            worker.processCheckOutCome(originalCHecksData, checkOutCome);
            outComeSent = true;
        }
    });

    //req sent
    req.end();
};

//if state change sent sms and save chevk outcome to database and sent to next process data here
worker.processCheckOutCome =(originalCHecksData, checkOutCome) => {
    //check if check outcome is up or down
    const state = !checkOutCome.error && checkOutCome.responseCode && 
    originalCHecksData.successCodes.indexOf(checkOutCome.responseCode) > -1 
    ? 'up': 'down';

    //decide whether we should alert the user or not
    const alertWanted = !!(originalCHecksData.lastChecked && originalCHecksData.state != state);

    //update the check data
    const newCheckData = originalCHecksData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err1) =>{
        if(!err1){
            if(alertWanted){
                //sent the check data to next process
                worker.alertUserToStatusChange(newCheckData);
            }else{
                console.log('Alert is not needed as there is no state change!');
            }
            
        }else{
            console.log('Error trying the save check data of one of the checks!');
        }
    });
}

//validate individual check data
worker.validateCheckData= (originalCHecksData) =>{
    const orginalData = originalCHecksData;

    if(originalCHecksData && originalCHecksData.id){

        orginalData.state = typeof(originalCHecksData.state) === 'string' && 
        ['up','down'].indexOf(originalCHecksData.state) > -1 ? 
        originalCHecksData.state : 'down';

        orginalData.lastChecked = typeof(originalCHecksData.lastChecked) === 'number' && 
        originalCHecksData.lastChecked > 0 ? originalCHecksData.lastChecked : false;

        //pass to the next process
        worker.performCheck(orginalData);
        

    }else{
        console.log('error: check was invalid or npt properly formatted')
    }
};

//sent to notifications sms if state change
worker.alertUserToStatusChange= (newCheckData) => {
    const msg = `Alert: You check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://
    ${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.phone, msg, (err)=>{
        if(!err){
            console.log(`user was alerted to a status change via SMS: ${msg}`);
        }else{
            console.log('there was a problem sending sms to one of the user!');
        }
    });
};

//timmer to the excute the worker process one per min (loop create)
worker.loop = () =>{
    setInterval(()=>{
        worker.gatherAllChecks();
    }, 9000);
};

// start the worker
worker.init = () =>{
    //execute all the check
    worker.gatherAllChecks();

    //call the  loop so that checks continue
    worker.loop();
}

//expoort
module.exports = worker;
