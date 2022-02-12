/**
 * Title: Environments
 * Description: Handle All Environments related things
 * Author: Nakib Uddin Ahmed
 * Data: 03/02/2022
 */

// dependencies

//modules scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'N@kib12345',
    maxChecks: 5,
    twilio: {
        fromPhone: '+18454128208',
        accountSid:'ACfd45cc1176e5cc7452ee1e2260849572',
        authToken: '0ff13ed71bb4310432f9f425219ba4db',
    },
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'N@kib12345',
    maxChecks: 5,
    twilio: {
        fromPhone: '+18454128208',
        accountSid:'ACfd45cc1176e5cc7452ee1e2260849572',
        authToken: '0ff13ed71bb4310432f9f425219ba4db',
    },
};

//determine which environment was pass
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? 
process.env.NODE_ENV : 'staging';


// expoert corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? 
environments[currentEnvironment] : environments.staging;


//exports module
module.exports = environmentToExport;