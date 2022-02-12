/**
 * Title: Data
 * Description: Handle file system
 * Author: Nakib Uddin Ahmed
 * Data: 02/02/2022
 */

// dependencies
const fs = require('fs');
const path = require('path');


// app object - module scaffolding
const lib = {};

//base directory of the data folder
lib.basedire = path.join(__dirname, '/../.data/');

//write data to file
lib.create = (dir, file, data, callback) => {
    //open file for writing
    fs.open( `${lib.basedire + dir}/${file}.json`, 'wx', (err, fileDescriptor) =>{
        if(!err && fileDescriptor){
            //convert data to string
            const stringData = JSON.stringify(data);

            //write data to file then close it
            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if(!err2){
                    fs.close(fileDescriptor, (err3) => {
                        if(!err3){
                            callback(false)
                        }else{
                            callback('Error closing the new file!')
                        }
                    });
                } else{
                    callback('Error writing to new file!');
                }
            });

        } else {
            callback('There was an error, file may already exists!');
        }
    });
};

//read data to file
lib.read = (dir, file, callback) => {
    fs.readFile( `${lib.basedire + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

//update existing file
lib.update = (dir, file, data, callback) => {
    //file open for writing
    fs.open(`${lib.basedire + dir}/${file}.json`,'r+', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            //convert data to string
            const stringData = JSON.stringify(data);

            //truncate the file
            fs.ftruncate(fileDescriptor, (err1) =>{
                if(!err1) {
                    //write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if(!err2) {
                            //close the file
                            fs.close(fileDescriptor, (err4) => {
                                if(!err4){
                                    callback(false);
                                }else{
                                    callback('Error closing the file!')
                                }
                            });
                        }else{
                            callback('Error writing to file!');
                        }
                    });
                } else {
                    callback('Errorr truncating file!')
                }
            });

        }else {
            console.log(`Error updating. File may not exist`);
        }
    });
};

//Delete existing file
lib.delete = (dir, file, callback) => {
    //unlink file
    fs.unlink(`${lib.basedire + dir}/${file}.json`, (err) => {
        if(!err){
            callback(false);
        } else {
            callback(`Error deleting file`);
        }
    });
};

// list all the item in a directory(database)
lib.list= (dir, callback)=>{
    fs.readdir(`${lib.basedire + dir}/`,(err, fileNames) => {
        if(!err && fileNames && fileNames.length > 0){
            const trimmedFileNames = [];
            fileNames.forEach(fileName=>{
                trimmedFileNames.push(fileName.replace('.json', ''));
            });  
            callback(false, trimmedFileNames);       
        }else{
            callback('error reading directory!');
        }
    });
};

module.exports = lib;