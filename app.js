process.env.NODE_ENV = 'config';

const { spawn, exec, execSync } = require('child_process');
const config = require('config');

var deviceInfo = {};
var connectionInfo = {};

deviceInfo.serialNumber = execSync('cat /proc/cpuinfo | grep Serial').toString().split(':')[1].trim();

connectionInfo.url = config.get('serverUrl');
connectionInfo.port = config.get('serverPort');

const ApiService = require('./services/api_service');
const SignalRService = require('./services/signalR_service');

// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var apiHandler = new ApiService(url, port);
var signalR = null;

run();

async function run() {
    deviceInfo.unitId = await apiHandler.connect(deviceInfo.serialNumber);

    signalR = new SignalRService(connectionInfo.url, connectionInfo.port, deviceInfo.unitId);

    while(true) {
        await delay(10000);
    }
}