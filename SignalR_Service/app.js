process.env.NODE_ENV = 'config';

const { spawn, exec, execSync } = require('child_process');
const config = require('config');

var connectionInfo = {
    "url": "http://paranoidandroid.network",
    "port": 52042
};

var deviceInfo = {};
deviceInfo.serialNumber = execSync('cat /proc/cpuinfo | grep Serial').toString().split(':')[1].trim();

const ApiService = require('./services/api_service');
const SignalRService = require('./services/signalR_service');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var apiHandler = new ApiService(connectionInfo.url, connectionInfo.port);

run();

async function run() {
    var response = await apiHandler.connect(deviceInfo.serialNumber);

    if(response.success) {
        deviceInfo.unitId = response.data;
    } else {
        console.log(response.data);
        return;
    }

    signalR = new SignalRService(connectionInfo.url, connectionInfo.port, deviceInfo.unitId);
    signalR.connect();

    while(true) {
        await delay(10000);
    }
}
// var signalR = null;

// run();

// async function run() {
//     deviceInfo.unitId = await apiHandler.connect(deviceInfo.serialNumber);

//     signalR = new SignalRService(connectionInfo.url, connectionInfo.port, deviceInfo.unitId);

//     while(true) {
//         await delay(10000);
//     }
// }