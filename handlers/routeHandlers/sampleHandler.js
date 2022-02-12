/*
 * Title: Sample Handler
 * Description: Sample Handler
 * Author: Nakib Uddin Ahmed
 * Date: 02/02/2022
 *
 */
// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);

    callback(200, {
        message: 'This is a sample url',
    });
};

module.exports = handler;
