const signalR = require("@microsoft/signalr");

var hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://marvin.webredirect.org:52042/agerDeviceHub")
    .withAutomaticReconnect()
    .build();

hubConnection.start().then(t => {
    hubConnection.send('test', 'testing');
})

for(var i = 0; i < 1000; i++) {

}