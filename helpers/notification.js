/*
 * Title: Notification library
 * Description: Important function to notify users
 * Author: Nakib Uddin Ahmed
 * Date: 02/02/2022
 *
 */

// dependencies
const https = require('https');
const { twilio } = require('./environment');
const queryString = require('query-string')

//module scaffolding
const notification = {};

//sent sms to user using  twilio api
notification.sendTwilioSms = (phone, meg, callback)=>{
    //input validation
    const userPhone = typeof(phone) === 'string' && phone.trim().length ===11
    ? phone.trim(): false;

    const userMsg = typeof(meg) === 'string' && meg.trim().length > 0 && 
    meg.trim().length <= 1600 ? meg.trim(): false;

    if(userPhone && userMsg){
        //configure the reequest payload
        const payload ={
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,

        }

        //stringify the payload
        const stringifyPayload = queryString.stringify(payload);

        //configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.JSON`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        //instantiate the request object
        const req = https.request(requestDetails, (res) =>{
            //get the status of the request
            const status = res.statusCode;
            //callback successfully if the request went through
            if(status ===200 || status === 201){
                callback(false);
            }else{
                callback(`Status code returned was ${status}`);
            }
        });

        req.on('error',(e)=>{
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();

    }else{
        callback('Given parameters were missing or invalid!');
    };


};

//export the module
module.exports = notification;