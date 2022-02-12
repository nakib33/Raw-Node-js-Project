/*
 * Title: Check Handler
 * Description: Route handler to handle check related route
 * Author: Nakib Uddin Ahmed
 * Date: 09/02/2022
 *
 */

//dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environment');
// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._check[requestProperties.method](requestProperties, callback);
    }else{
        callback(405);
    }

};

handler._check = {};


handler._check.post = (requestProperties, callback) =>{
    //validate inputs
    const protocol = typeof(requestProperties.body.protocol) === 'string' && 
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ?
    requestProperties.body.protocol: false

    const url = typeof(requestProperties.body.url) === 'string' && 
    requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof(requestProperties.body.method) === 'string' && 
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? 
    requestProperties.body.method : false;

    const successCodes = typeof(requestProperties.body.successCodes) === 'object' &&  
    requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false ;

    const timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' &&  
    requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >=1 
    && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;
    
    if(protocol && url && method && successCodes && timeoutSeconds){

        const token = typeof(requestProperties.headersObject.token)==='string'?
        requestProperties.headersObject.token : false;


        // look the user phone by reading the token
        data.read('token', token, (err1, tokenData)=>{
            if(!err1 && tokenData){
                const phone = parseJSON(tokenData).phone;
                //lookup the user data
                data.read('users', phone, (err2, userData)=>{
                    if(!err2 && userData){
                        tokenHandler._token,verify(token, phone, (tokenIsValid)=>{
                            if(tokenIsValid){
                                const userObject = parseJSON(userData);
                                const userChecks = typeof(userObject.checks) === 'object' && userObject.checks
                                instanceof Array ? userObject.checks: [];

                                if(userChecks.length < maxChecks){
                                    const checkId =createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        phone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    //save the object
                                    data.create('checks', checkId, checkObject, (err3)=>{
                                        if(!err3){
                                            //ADD CHECK ID TO THE USER'S OBJECT
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user
                                            data.update('users', phone, userObject, (err4)=>{
                                                if(!err4){
                                                    //returen the data about the new check
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500,{
                                                        error: 'There was a problem in the server!',
                                                    });
                                                }
                                            })
                                            
                                        }else{
                                            callback(500,{
                                                error: 'There was a problem in the server!',
                                            });
                                        }
                                    });
                                }else{
                                    callback(403,{
                                        error: 'User has already reached max checks limit!',
                                    });
                                }
                            }else{
                                callback(400,{
                                    error: 'Authenication problem!',
                                });
                            }
                        });
                    }else{
                        callback(403,{
                            error: 'User not found!',
                        });
                    }
                });

            }else{
                callback(403, {
                    error: 'Authenication problem!',
                })
            }
        });
    }else{
        callback(400,{
            error: 'Your Have Problem in your request',
        });
    }

};


handler._check.get = (requestProperties, callback) =>{
    const id= typeof(requestProperties.queryStringObject.id) === 'string' && 
    requestProperties.queryStringObject.id.trim().length === 20 ? 
    requestProperties.queryStringObject.id : false;

    if(id){
        data.read('checks', id, (err1, checkData)=>{
            if(!err1 && checkData){
                const token = typeof(requestProperties.headersObject.token)==='string'?
                requestProperties.headersObject.token : false;

                tokenHandler._token,verify(token, parseJSON(checkData).phone
                    , (tokenIsValid)=>{
                    if(tokenIsValid){
                        callback(200, parseJSON(checkData));
                    }else{
                        callback(403 ,{
                            error: 'Authenication failed',
                        });
                    }
                });
            }else{
                callback(500,{
                    error: 'Your Have Problem in your request',
                });
            }
        });
    }else{
        callback(400,{
            error: 'Your Have Problem in your request',
        });
    }
};


handler._check.put = (requestProperties, callback) =>{
    const id = typeof(requestProperties.body.id) === 'string' && 
    requestProperties.body.id.trim().length === 20? 
    requestProperties.body.id : false;

     //validate inputs
     const protocol = typeof(requestProperties.body.protocol) === 'string' && 
     ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ?
     requestProperties.body.protocol: false
 
     const url = typeof(requestProperties.body.url) === 'string' && 
     requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
 
     const method = typeof(requestProperties.body.method) === 'string' && 
     ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? 
     requestProperties.body.method : false;
 
     const successCodes = typeof(requestProperties.body.successCodes) === 'object' &&  
     requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false ;
 
     const timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' &&  
     requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >=1 
     && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;
     

    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            data.read('checks', id, (err1, checkData) =>{
                if(!err1 && checkData){
                    const checkObject = parseJSON(checkData);

                    const token = typeof(requestProperties.headersObject.token)==='string'?
                    requestProperties.headersObject.token : false;

                    tokenHandler._token,verify(token, checkObject.phone
                    , (tokenIsValid)=>{
                        if(tokenIsValid){
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            //store the checkobject / object
                            data.update('checks', id, checkObject, (err2)=>{
                                if(!err2){
                                    callback(200);
                                }else{
                                    callback(500, {
                                        error: 'there was a server side error!',
                                    });
                                }
                            });
                        }else{
                                callback(403,{
                                error: 'Authentication Error!',
                            });
                        }
                    });

                }else{
                        callback(400,{
                        error: 'There was a server side problem',
                    });
                }
            });

        }else{
            callback(400,{
                error: 'You must provide at least one field to update',
            });
        }
    }else{
        callback(400,{
            error: 'Your Have Problem in your request',
        });
    }
};

handler._check.delete= (requestProperties, callback) =>{
    const id= typeof(requestProperties.queryStringObject.id) === 'string' && 
    requestProperties.queryStringObject.id.trim().length === 20 ? 
    requestProperties.queryStringObject.id : false;

    if(id){
        data.read('checks', id, (err1, checkData)=>{
            if(!err1 && checkData){
                const token = typeof(requestProperties.headersObject.token)==='string'?
                requestProperties.headersObject.token : false;

                tokenHandler._token,verify(token, parseJSON(checkData).phone
                    , (tokenIsValid)=>{
                    if(tokenIsValid){
                        //delete the check daata
                        data.delete('checks', id, (err2)=>{
                            if(!err2){
                                data.read('users', parseJSON(checkData).phone, (err3, userData)=>{
                                    const userObject = parseJSON(userData);
                                    if(!err3 && userData){
                                        const userChecks = typeof(userObject.checks) === 'object' && userObject.checks
                                        instanceof Array ? userObject.checks: [];

                                        //remove the deleted check id from user's list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            //resave the user data
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err4)=>{
                                                if(!err4){
                                                    callback(200);
                                                }else{
                                                    callback(502 ,{
                                                        error: 'There was a server side error!',
                                                    });
                                                }
                                            })
                                        }else{
                                            callback(502 ,{
                                                error: 'Not remove the deleted check id from users list',
                                            });
                                        }
                                    }else{
                                        callback(501 ,{
                                            error: 'There was a server side problem!',
                                        });
                                    }
                                });
                            }else{
                                callback(500 ,{
                                    error: 'There was a server side problem!',
                                });
                            }
                        });
                    }else{
                        callback(403 ,{
                            error: 'Authenication failed',
                        });
                    }
                });
            }else{
                callback(500,{
                    error: 'Your Have Problem in your request',
                });
            }
        });
    }else{
        callback(400,{
            error: 'Your Have Problem in your request',
        });
    }
};

module.exports = handler;
