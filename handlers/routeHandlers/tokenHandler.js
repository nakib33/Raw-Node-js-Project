/*
 * Title: Token Handler
 * Description: Route handler to handle token related route
 * Author: Nakib Uddin Ahmed
 * Date: 08/02/2022
 *
 */

//dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._token[requestProperties.method](requestProperties, callback);
    }else{
        callback(405);
    }

};

handler._token = {};
 
handler._token.post = (requestProperties, callback) =>{
    const phone = typeof(requestProperties.body.phone) === 'string' && 
    requestProperties.body.phone.trim().length === 11 ? 
    requestProperties.body.phone : false;

    const password = typeof(requestProperties.body.password) === 'string' && 
    requestProperties.body.password.trim().length > 4 ? 
    requestProperties.body.password : false;

    if(phone && password){
        data.read('users',phone, (err1, userData) =>{
            const hashedpassword = hash(password); 
            if(hashedpassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObjcet = {
                    phone,
                    id : tokenId,
                    expires,

                };

                //store the token
                data.create('token', tokenId, tokenObjcet, (err2)=>{
                    if(!err2){
                        callback(200,tokenObjcet);
                    } else {
                        callback(500,{
                            error: 'there was a problem in th server side',
                        });
                    }
                });
            } else {
                callback(400,{
                    error: 'Password is not valid',
                });
            }
        });
    } else {
        callback(400,{
            error: 'You have a problem in your request',
        });
    }
};


handler._token.get = (requestProperties, callback) =>{
    const id= typeof(requestProperties.queryStringObject.id) === 'string' && 
    requestProperties.queryStringObject.id.trim().length === 20 ? 
    requestProperties.queryStringObject.id : false;

    if(id){
        //look the token
        data.read('token', id, (err, tokenData) =>{
            const token = { ...parseJSON(tokenData) };
 
            if(!err && token){
                callback(200, token)
            }else{
                callback(404,{
                    'error': 'Token was not found!',
                });
            }
        });
    }else{
        callback(404,{
            'error': 'Token was not found!',
        });
    }
};

 
handler._token.put = (requestProperties, callback) =>{
    const id = typeof(requestProperties.body.id) === 'string' && 
    requestProperties.body.id.trim().length === 20 ? 
    requestProperties.body.id : false;

    const extend = !!(
        typeof(requestProperties.body.extend) === 'boolean' && 
        requestProperties.body.extend === true 
    );

    if(id && extend){
        data.read('token', id, (err1, tokenData)=>{
            const tokenObject = parseJSON(tokenData);
            if(tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                //store the updated token
                data.update('token', id, tokenObject, (err2)=>{
                    if(!err2){
                        callback(200);
                    }else{
                        callback(500,{
                            error: 'There was a server side error!',
                        });
                    }
                })
            }else{
                callback(400,{
                    error: 'Token already expired!',
                });
            }
        })
    }else{
        callback(400,{
            error: 'There was aproblem in your request',
        });
    }


};


handler._token.delete= (requestProperties, callback) =>{
    //check the token validtation
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && 
    requestProperties.queryStringObject.id.trim().length === 20 ? 
    requestProperties.queryStringObject.id : false;

    if(id){
        //look up the token
        data.read('token',id,(err1,tokenData)=>{
            if(!err1 && tokenData){
                data.delete('token', id, (err2)=>{
                    if(!err2){
                        callback(200,{
                            'message': 'token successfully deleted!',
                        });
                    }else{
                        callback(500,{
                            'error':'There was a server site problem!',
                        });
                    }
                });
            }else{
                callback(500,{
                    'error':'There was a server site problem!',
                })
            }
        });
    }else{
        callback(400,{
            'error': 'There was a problem in your request!',
        })
    }
};

handler._token,verify=(id, phone, callback)=>{
    data.read('token', id, (err1, tokenData)=>{
        if(!err1 && tokenData){
            if(parseJSON(tokenData).phone === phone && 
            parseJSON(tokenData).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
};


module.exports = handler;
