const signalR = require('@microsoft/signalr');

module.exports = class SignalRService {
    constructor(url, port, unitId){
        this.baseUrl = url;
        this.unitId = unitId;
        this.basePort = port;
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}:${basePort}/agerDeviceHub?unit=${unitId}`)
            .withAutomaticReconnect()
            .build();
    }

    connect() {
        this.hubConnection.start().then(t => {
            console.log("connected");
        })
    }
}