/*
 * Title: Utilities
 * Description: important utilitis function
 * Author: Nakib Uddin Ahmed
 * Date: 05/02/2022
 *
 */
const crypto = require('crypto');
const environments = require('./environment');

// module scaffolding
const utilities = {};

//parse json string to object
utilities.parseJSON = (jsonString) =>{
    let output = {};

    try{
        output = JSON.parse(jsonString);
    }catch{
        output = {};
    }
    return output;
};

//password hash string
utilities.hash = (str) =>{
    if(typeof(str) === 'string' && str.length > 4){
        const hash = crypto.createHmac('sha256', environments.secretKey)
        .update(str)
        .digest('hex');

        return hash;
    }

    return false;
};
//create random string
utilities.createRandomString= (strLength) =>{

    let length = strLength;
    length = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

    if(length){
        const possiblecharacters = 'abcdefghijklmnopqrstuvwxyz123456789';
        let output = '';
        for(let i=1; i<=length; i+=1){
            const randomCharacter = 
            possiblecharacters.charAt(Math.floor(Math.random()* 
            possiblecharacters.length));

            output += randomCharacter;
        }
        return output;
    }else{
        return false;
    }
}; 

//export module
module.exports = utilities;
