const fs = require('fs');
const FILE_PATH = './data/employees.json';

// Read and parse employees
function readEmployees() {
    if (!fs.existsSync(FILE_PATH)) {
        return [];
    }
    try {
        const dataText = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(dataText);
    } catch (error) {
        console.log("Error parsing employee data file. Returning empty array.");
        return [];
    }
}

// Stringify and save employees
function writeEmployees(dataArray) {
    try {
        const dataText = JSON.stringify(dataArray, null, 2);
        fs.writeFileSync(FILE_PATH, dataText);
    } catch (error) {
        console.log("Could not save data to the file.");
    }
}
module.exports = { readEmployees, writeEmployees };