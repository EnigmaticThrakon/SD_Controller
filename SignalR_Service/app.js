process.env.NODE_ENV = 'config';

const { spawn, exec, execSync } = require('child_process');
const redis = require('redis');
const main_redis_handler = redis.createClient();
const live_data_subscriber = redis.createClient();
const command_publisher = redis.createClient();
const config = require('config');
const Mutex = require('async-mutex').Mutex;

var connection_info = {
    "url": "http://paranoidandroid.network",
    "port": 52042
};

var device_info = {};
device_info.serialNumber = execSync('cat /proc/cpuinfo | grep Serial').toString().split(':')[1].trim();

const ApiService = require('./services/api_service');
var api_handler = new ApiService(connection_info.url, connection_info.port);
var signalr = null;

const { SignalRService, SignalRMethods } = require('./services/signalR_service');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
var transmission_timer = setInterval(sendData, 1000);

const queue_mutext = new Mutex();
var data_queue = [];

api_handler.connect(device_info.serialNumber).then(response => {
    if(response.success) {
        device_info.unitId = response.data;
        signalr = new SignalRService(connection_info.url, connection_info.port, device_info.unitId);
        signalr.connect().then(resolved => {
            connectRedis();
        }, rejection => {
            console.log("Error Connecting SignalR to Server: " + rejection);
        });
    } else {
        var error_message = "Error Connecting to Server: " + response.data;
        cleanup(error_message);
    }
});

async function connectRedis() {
    main_redis_handler.on('connect', () => {
        console.log("Connected to Redis");
        run();
    });
    main_redis_handler.on('error', err => {
        var error_message = "Error Connecting to Redis: " + err;
        cleanup(error_message);
    })
    main_redis_handler.connect();
}

async function run() {
    await live_data_subscriber.connect();
    await command_publisher.connect();

    live_data_subscriber.subscribe('live:data', async (data) => {
        const release = await queue_mutext.acquire();
        data_queue.push(JSON.parse(data));
        release();
    });

    signalr.receiveCommand(executeCommand);
}

async function sendData() {
    var data = [];

    const release = await queue_mutext.acquire();
    data = data_queue;
    data_queue = [];
    release();

    if(data.length > 0) {
        signalr.sendMessage(SignalRMethods.LiveData, device_info.unitId, JSON.stringify(data));
    }
}

async function executeCommand(message) {
    if(command_publisher.isReady) {
        if(message.toString().toUpperCase().includes("UPDATEPARAMETERS")) {
            var publishData = message.toString().substring(message.toString().indexOf(' ') + 1);
            main_redis_handler.publish('write:plc', publishData);
        } else {
            switch(message.toString().toUpperCase()){
                case "START":
                    main_redis_handler.set('acquisition:started', 1);
                    break;
                case "STOP":
                    main_redis_handler.set('acquisition:started', 0);
                    break;
                case "SHUTDOWN":
                    break;
                case "HUMIDITY-START":
                    main_redis_handler.publish("write:plc", "hStart");
                    break;
                case "HUMIDITY-STOP":
                    main_redis_handler.publish('write:plc', 'hStop');
                    break;
                default:
    
                    console.log("Unrecognized message received");
            }
        }
    } else {
        console.log("Command Received Before Publisher Was Ready");
    }
}

async function cleanup(error_message) {
    clearInterval(transmission_timer);
    live_data_subscriber.unsubscribe('live:data');

    main_redis_handler.disconnect();
    live_data_subscriber.disconnect();
    command_publisher.disconnect();

    delay(1000);

    if(error_message != null) {
        console.log(error_message);
        process.exit(1);
    }

    process.exit(0);
}