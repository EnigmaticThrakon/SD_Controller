// Change the working directory to this directory
process.chdir('/home/pi/dev/SD_Controller/SignalR_Service');

// Get the configurations
const config = require('config');

// Read in needed dependencies for executing commands and using mutexes
const { spawn, exec, execSync } = require('child_process');
const Mutex = require('async-mutex').Mutex;

// Create the mutex that will protect the real-time data queue
const queue_mutext = new Mutex();

// Declare and initialize the real-time data queue
var data_queue = [];

// Declare an object to hold information about the device
// Initialize the object with the serial number of the device
var device_info = {
    serialNumber: execSync('cat /proc/cpuinfo | grep Serial').toString().split(':')[1].trim()
};

// Read in the Redis dependency and create the needed clients
const redis = require('redis');
const main_redis_handler = redis.createClient();
const live_data_subscriber = redis.createClient();
const command_publisher = redis.createClient();

// Create a generic delay that can be used in async functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Read in custom modules that will be used for Wi-Fi communications
const { SignalRService, SignalRMethods } = require('./services/signalR_service');
const ApiService = require('./services/api_service');

// Declaring and initializing the api service for initial communications with the server
var api_handler = new ApiService(config.connectionInfo.url, config.connectionInfo.port);

// Declaring the signalr service
var signalr = null;

// Setting up a timer to periodically send data to the server
var transmission_timer = setInterval(sendData, 1000);

// Call the connection api endpoint to make sure a connection can be established and
//      get the unit id from the server
api_handler.connect(device_info.serialNumber).then(response => {

    // If the response is a success, save the unit id and initialize/connect the signalr module
    if(response.success) {
        device_info.unitId = response.data;
        signalr = new SignalRService(config.connectionInfo.url, config.connectionInfo.port, device_info.unitId);
        signalr.connect().then(() => {

            // If the connection was successful, start making the necessary connections to Redis
            connectRedis();
        }, rejection => {

            // If the connection was unsuccessful, log the error and close;
            var error_message = `Error Connecting SignalR to Server: ${rejection}`;
            cleanup(error_message);
        });
    } else {

        // If the response was a failure, log the message and close
        var error_message = `Error Connecting to Server: ${response.data}`;
        cleanup(error_message);
    }
});

// Function to handle initial Redis connections
async function connectRedis() {

    // Set a callback on when the Redis client connects
    main_redis_handler.on('connect', () => {

        // Log the success and start the main program
        console.log("Connected to Redis");
        run();
    });

    // Set a callback on when the connection to Redis fails
    main_redis_handler.on('error', err => {

        // Log the error message and close the program
        var error_message = `Error Connecting to Redis: ${err}`;
        cleanup(error_message);
    });

    // Perform the main Redis handler connection
    main_redis_handler.connect();
}

// Function to handle the main functionality of the program
async function run() {

    // Connect the secondary Redis handlers
    await live_data_subscriber.connect();
    await command_publisher.connect();

    // Subscribe to the 'live:data' channel for real-time data
    live_data_subscriber.subscribe('live:data', async (data) => {

        // Use the mutex to push values onto the data queue
        const release = await queue_mutext.acquire();
        data_queue.push(JSON.parse(data));
        release();
    });

    // Set the callback function for when the signalr module receives a message
    signalr.receiveCommand(executeCommand);
}

// Function that is periodically called to send data to the server
async function sendData() {

    // Declare and initialize a temporary data array
    var data = [];

    // Use the mutex to get the data out of the queue and clear the queue
    const release = await queue_mutext.acquire();
    data = data_queue;
    data_queue = [];
    release();

    // If the data array isn't empty, send it to the server
    if(data.length > 0) {
        signalr.sendMessage(SignalRMethods.LiveData, device_info.unitId, JSON.stringify(data));
    }
}

// Function that's called when the signalr module receives a message
async function executeCommand(message) {

    // Make sure the Redis handler used for publishing is connected and ready
    if(command_publisher.isReady) {

        // If it is, check to see if the message includes the string that means to write data to the plc
        if(message.toString().toUpperCase().includes("UPDATEPARAMETERS")) {

            // If it does, parse the message and send the necessary data into Redis
            var publishData = message.toString().substring(message.toString().indexOf(' ') + 1);
            main_redis_handler.publish('write:plc', publishData);
        } else {

            // Switch statement to determine what data needs to be set where in Redis
            switch(message.toString().toUpperCase()){

                // Cases used to start or stop the acquisition
                case "START":
                    main_redis_handler.set('acquisition:started', 1);
                    break;
                case "STOP":
                    main_redis_handler.set('acquisition:started', 0);
                    break;
                default:

                    // If the command isn't recognized, log the occurance
                    console.log("Unrecognized message received");
            }
        }
    } else {

        // If the Redis connection isn't ready, log the occurance
        console.log("Command Received Before Publisher Was Ready");
    }
}

// Function to handle the cleanup of modules and timers
async function cleanup(error_message) {

    // Clear the interval used to send data to the server
    clearInterval(transmission_timer);

    // Unsubscribe from the real-time data channel
    live_data_subscriber.unsubscribe('live:data');

    // Disconnect all the Redis connections if they're connected
    if(main_redis_handler.isReady)
        await main_redis_handler.disconnect();

    if(live_data_subscriber.isReady)
        await live_data_subscriber.disconnect();

    if(command_publisher.isReady)
        await command_publisher.disconnect();

    // Wait a second to allow for things to settle
    delay(1000);

    // If there is an error message, then print it and exit with a 1
    if(error_message != null) {
        console.log(error_message);
        process.exit(1);
    }

    // If no error message, exit with a 0
    process.exit(0);
}