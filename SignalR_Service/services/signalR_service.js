const signalR = require('@microsoft/signalr');

class SignalRService {
    constructor(url, port, unitId){
        this.baseUrl = url;
        this.unitId = unitId;
        this.basePort = port;
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseUrl}:${this.basePort}/agerDeviceHub?unit=${this.unitId}`)
            .withAutomaticReconnect()
            .build();
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.hubConnection.start().then(t => {
                console.log("SignalR Connected to Server");
                resolve();
            }).catch(err => {
                console.log("Error Connecting SignalR to Server: " + err);
                reject();
            })
        });
    }

    receiveCommand(callbackFunction) {
        this.hubConnection.on('ExecuteCommand', message => {
            callbackFunction(message);
        });
    }

    sendMessage(channel, unitId, data) {
        this.hubConnection.send(channel, unitId, data);
    }
}

module.exports = {
    SignalRService: SignalRService,
    SignalRMethods: Object.freeze({
        LiveData: "LiveData"
    })
}