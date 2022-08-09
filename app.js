process.env.NODE_ENV = 'config';

const { spawn, exec, execSync } = require('child_process');
const config = require('config');

var connectionInfo = config.get("connectionInfo");

var deviceInfo = {};
deviceInfo.serialNumber = execSync('cat /proc/cpuinfo | grep Serial').toString().split(':')[1].trim();

const ApiService = require('./services/api_service');
const SignalRService = require('./services/signalR_service');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var apiHandler = new ApiService(connectionInfo.url, connectionInfo.port);

run();

async function run() {
    var response = await apiHandler.performPost("api/Test/testPost", { id: "3451c9d3-6ea1-473d-ac3c-31d28af0ae81", deviceId: "abc", publicIP: "127.0.0.1" });

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