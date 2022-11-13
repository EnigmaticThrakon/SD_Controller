// Requirement for making a connection over signalr
const signalR = require('@microsoft/signalr');

// Class for creating and handling signalr connection
class SignalRService {

    // Pass in the url and port of the server, along with the unit id
    constructor(url, port, unitId){
        this.baseUrl = url;
        this.unitId = unitId;
        this.basePort = port;

        // Build the connection that will be used
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseUrl}:${this.basePort}/agerDeviceHub?unit=${this.unitId}`)
            .withAutomaticReconnect()
            .build();
    }

    // Function that is used to start the connection to the server over signalr
    connect() {

        // Return a promise object to be used for asynchronous callbacks
        return new Promise((resolve, reject) => {
            this.hubConnection.start().then(t => {

                // If the connection was a success, log the success and resolve the promise
                console.log("SignalR Connected to Server");
                resolve();
            }).catch(err => {

                // If the connection failed, log the failure and reject the promise
                console.log("Error Connecting SignalR to Server: " + err);
                reject();
            })
        });
    }

    // Function used to pair the 'ExecuteCommand' local signalr call to a callback function
    receiveCommand(callbackFunction) {
        this.hubConnection.on('ExecuteCommand', message => {

            // Pass the received message to the callback function
            callbackFunction(message);
        });
    }

    // Function that's used to send a message to the server
    sendMessage(channel, unitId, data) {

        // Channel is the function name in the server hub
        // Unit id is used to pair the connection id and device
        // Data is the message being sent to the server for parsing
        this.hubConnection.send(channel, unitId, data);
    }
}

module.exports = {
    SignalRService: SignalRService,
    SignalRMethods: Object.freeze({
        LiveData: "LiveData"
    })
}