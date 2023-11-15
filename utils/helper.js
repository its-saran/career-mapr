import createError from 'http-errors';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import ExcelJS from 'exceljs';
import fastCsv from 'fast-csv';
import fs from 'fs';
import path from 'path';
import config from '../config/config.json' assert { type: "json" };


const utils = {
    waitFor: delay => new Promise(resolve => setTimeout(resolve, delay)),
    shuffle: (array) => {
        for(let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    createError: ({status, message, details}) => {
        if (status && message && details)  {
            return { error: { status, message, details }}
        } else if (status && message && !details ) {
            return { error: { status, message }}
        } else if(status && !message && details) {
            const err = createError(status)
            return { error: { status: err.status, message: err.message, details }}
        } else if (status && !message && !details ) {
            const err = createError(status)
            return { error: { status: err.status, message: err.message }}
        }
    },
    time: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY h:mm:ss A'),
    timeMilli: () => moment().tz('Asia/Kolkata').format('DD-MM-YYYY h:mm:ss.SSS A'),
    timeId: () => moment().tz('Asia/Kolkata').format('YYYYMMDD-hhmmssSSS'),
    timeStamp: () => moment().tz('Asia/Kolkata').toISOString(),
    moment: () => moment(),
    elapseTime : (startTime, endTime) => moment.duration(endTime.diff(startTime)).asSeconds(),
    logMessage : (serviceName, serviceType, message) => {
        serviceName = utils.capitalizeString(serviceName)
        serviceType = utils.capitalizeString(serviceType)
        console.log(`${serviceName} | ${serviceType} | ${utils.time()} | ${message}`)
    },
    timeLog : (message) => {
        console.log(` ${utils.time()} | ${message}`)
    },
    addId : (array, Idkey, Idvalue) => array.map(item => ({...item, [Idkey]: `${Idvalue}`})),
    addUniqueId : (array, Idkey, IdvaluePrefix) => array.map(item => ({...item, [Idkey]: `${IdvaluePrefix}`+`${uuidv4()}`})),
    addObjectInArray : (array, key, value) => array.map(item => ({...item, [key]: value})),
    capitalizeString: (string) => string.charAt(0).toUpperCase() + string.slice(1),
    objectToString: (obj) => Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(', '),
    filterObject: (obj) => {
        return Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => value !== null && value !== undefined)
        );
    },
    createJSON: (outputConfig, data) => {

        let folderPath = outputConfig.folderPath
        let fileName = outputConfig.fileName
        if (!folderPath) {
            folderPath = config.outputPath
        } 

        const jsonString = JSON.stringify(data, null, 2);
        fileName = fileName+'.json'
        const filePath = path.join(folderPath, fileName);

        // Create the folder if it doesn't exist
        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating folder:', err);
            } else {
                // Write the JSON file
                fs.writeFile(filePath, jsonString, 'utf-8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                } else {
                    console.log(`\nJSON file created successfully!`);
                }
                });
            }
        });
    },
    createXLSX: (outputConfig, data) => {
        
        let folderPath = outputConfig.folderPath
        let fileName = outputConfig.fileName
        if (!folderPath) {
            folderPath = config.outputPath
        } 

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Create a new workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheetName = 'Sheet 1'
        const worksheet = workbook.addWorksheet(worksheetName);
    
        // Use the keys of all objects in the data array as headers
        const headers = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
    
        // Extract column headers from the keys
        const columns = headers.map(key => ({
            header: key.charAt(0).toUpperCase() + key.slice(1),
            key,
            width: 20,
        }));
    
        // Add columns to the worksheet
        worksheet.columns = columns;
    
        // Write each row of data to the worksheet
        data.forEach(row => {
            // Pad the row with empty strings for missing properties
            const paddedRow = headers.map(key => row[key] || '');
            worksheet.addRow(paddedRow);
        });
    
        // Save the workbook to a file
        workbook.xlsx.writeFile(`${folderPath}/${fileName}.xlsx`);
    
        console.log('\nExcel file created successfully!');
    },
    createCSV: (outputConfig, data) => {
        try {

            let folderPath = outputConfig.folderPath
            let fileName = outputConfig.fileName
            if (!folderPath) {
                folderPath = config.outputPath
            } 

            if (!fs.existsSync(folderPath)) {
              fs.mkdirSync(folderPath, { recursive: true });
            }
        
            const filePath = path.join(folderPath, `${fileName}.csv`);
            const writableStream = fs.createWriteStream(filePath);
        
            const csvStream = fastCsv.format({ headers: true });
        
            csvStream.pipe(writableStream);
        
            // Use the keys of all objects in the data array as headers
            const headers = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
        
            // Write the headers to the CSV file
            csvStream.write(headers);
        
            // Write each row of data to the CSV file
            data.forEach(row => {
              // Pad the row with empty strings for missing properties
              const paddedRow = headers.map(key => row[key] || '');
              csvStream.write(paddedRow);
            });
        
            csvStream.end();
        
            console.log(`\nCSV file created successfully!`);
        } catch (error) {
        console.error('Error creating CSV file:', error);
        }
    }
}

export default utils;




