/*
 * Title: User Handler
 * Description: Route handler to handle user related route
 * Author: Nakib Uddin Ahmed
 * Date: 05/02/2022
 *
 */

//dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler')
// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._users[requestProperties.method](requestProperties, callback);
    }else{
        callback(405);
    }

};

handler._users = {};

//add user information
//postman: "post seletct then -> http://localhost:3000/user"
/*
    {
        "firstName": "Nakib Uddin",
        "lastName": "Ahmed",
        "phone": "01719230676",
        "password": "nakib123",
        "tosAgreement": true
    }
*/ 
handler._users.post = (requestProperties, callback) =>{
    const firstName = typeof(requestProperties.body.firstName) === 'string' && 
    requestProperties.body.firstName.trim().length > 0 ? 
    requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && 
    requestProperties.body.lastName.trim().length > 0 ? 
    requestProperties.body.lastName : false;

    const phone = typeof(requestProperties.body.phone) === 'string' && 
    requestProperties.body.phone.trim().length === 11 ? 
    requestProperties.body.phone : false;

    const password = typeof(requestProperties.body.password) === 'string' && 
    requestProperties.body.password.trim().length > 4 ? 
    requestProperties.body.password : false;

    const tosAgreement = typeof(requestProperties.body.tosAgreement) === 'boolean' && 
    requestProperties.body.tosAgreement ? 
    requestProperties.body.tosAgreement: false;

    if(firstName && lastName && phone && password && tosAgreement){
        //make sure that user doesnot all ready exsis
        data.read('users', phone, (err1)=>{
            if(err1){
                //next step work
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                //store the user to db
                data.create('users',phone, userObject,(err2)=>{
                    if(!err2){
                        callback(200,{
                            'message': 'User Create Successfully'
                        });
                    }else{
                        callback(500,{'error':'Could not create user!'});
                    }
                });
            }else{
                callback(500,{
                    'error': 'There was a problem in server side!',
                });
            }
        });   
     }else{
        callback(400,{
            error: 'You have a problem in your request',
        });
    }
};

//View user using phone number
//postman: "get seletct then -> http://localhost:3000/user?phone=01719230676"
handler._users.get = (requestProperties, callback) =>{
    //check the phone number if valid
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' && 
    requestProperties.queryStringObject.phone.trim().length === 11 ? 
    requestProperties.queryStringObject.phone : false;

    if(phone){
        //vverify token
        let token = typeof(requestProperties.headersObject.token)==='string'?
        requestProperties.headersObject.token : false;

        tokenHandler._token,verify(token, phone, (tokenId) =>{
            if(tokenId){
                data.read('users', phone, (err, usr) =>{
                    const user = { ...parseJSON(usr) };
         
                    if(!err && user){
                        delete user.password;
                        callback(200, user)
                    }else{
                        callback(404,{
                            'error': 'User was not found!',
                        });
                    }
                });
            }else{
                callback(403,{
                    'error': 'Authentication Failed!',
                });
            }
        });
        //look the user
    }else{
        callback(404,{
            'error': 'User was not found!',
        });
    }
};


//Update user information
//postman: "post seletct then -> http://localhost:3000/user"
/*
    {
        "firstName": "Sayeda",
        "lastName": "Rownak",
        "phone": "01719230676",
        "password": "Rown@k123"
    }
*/ 
handler._users.put = (requestProperties, callback) =>{
    //check the phone validtation
    const phone = typeof(requestProperties.body.phone) === 'string' && 
    requestProperties.body.phone.trim().length === 11 ? 
    requestProperties.body.phone : false;

    const firstName = typeof(requestProperties.body.firstName) === 'string' && 
    requestProperties.body.firstName.trim().length > 0 ? 
    requestProperties.body.firstName : false;

    const lastName = typeof(requestProperties.body.lastName) === 'string' && 
    requestProperties.body.lastName.trim().length > 0 ? 
    requestProperties.body.lastName : false;

    const password = typeof(requestProperties.body.password) === 'string' && 
    requestProperties.body.password.trim().length > 4 ? 
    requestProperties.body.password : false;

    if(phone){
        let token = typeof(requestProperties.headersObject.token)==='string'?
        requestProperties.headersObject.token : false;

        tokenHandler._token,verify(token, phone, (tokenId) =>{
            if(tokenId){
                if(firstName || lastName || password){
                    //lookup the user
                    data.read('users',phone,(err, uData)=>{
                        const userData = { ...parseJSON(uData) };
                        //update
                        if(!err && userData){
                            if(firstName){
                                userData.firstName = firstName;
                            }
    
                            if(lastName){
                                userData.lastName = lastName;
                            }
    
                            if(password){
                                userData.password= hash(password);
                            }
    
                            //store database
                            data.update('users',phone, userData, (err2)=>{
                                if(!err2){
                                    callback(200,{
                                        'message': 'User information was updated successfully!',
                                    });
                                }else{
                                    callback(500,{
                                        'error': 'There was a problem in server site!',
                                    });
                                }
                            });
    
                        }else{
                            callback(400,{
                                'error': 'You have a problem in your request!',
                            });
                        }
                    });
                }else{
                    callback(400,{
                        'error': 'You have a problem in your request!',
                });
            }
            }else{
                callback(403,{
                    'error': 'Authentication Failed!',
                });
            }
        });
            
    }else{
        callback(404,{
            'error': 'Invalid Phone number. Please try again!',
        });
    }
};

//delete user information
//postman: "delete seletct then -> http://localhost:3000/user?phone=01719230676"
handler._users.delete= (requestProperties, callback) =>{
    //check the phone validtation
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' && 
    requestProperties.queryStringObject.phone.trim().length === 11 ? 
    requestProperties.queryStringObject.phone : false;

    if(phone){
        let token = typeof(requestProperties.headersObject.token)==='string'?
        requestProperties.headersObject.token : false;

        tokenHandler._token,verify(token, phone, (tokenId) =>{
            if(tokenId){
                data.read('users',phone,(err1,userData)=>{
                    if(!err1 && userData){
                        data.delete('users', phone, (err2)=>{
                            if(!err2){
                                callback(200,{
                                    'message': 'User successfully deleted!',
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
                callback(403,{
                    'error': 'Authentication Failed!',
                });
            }
        });
        //look up the user
        
    }else{
        callback(400,{
            'error': 'There was a problem in your request!',
        })
    }
};

module.exports = handler;
