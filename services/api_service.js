const http = require('http');

module.exports = class ApiService {
    constructor(url, port) {
        this.baseUrl = url;
        this.basePort = port;
    }

    async connect(serialNumber) {
        return performGet('/api/Units/Connect', [ serialNumber ]);
    }

    performPost(apiEndpoint, data) {
        const postData = JSON.stringify(data);
        const options = {
            hostname: this.baseUrl,
            port: this.basePort,
            path: apiEndpoint, //(i.e. /api/Units/connect)
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (data) => {
                    resolve(data);
                });
                res.on('end', () => {
                    console.log("Post Complete");
                });
            });

            req.on('error', (e) => {
                reject(e);;
            });

            req.write(postData);
            req.end();
        })
    }

    performGet(apiEndpoint, values) {
        return new Promise((resolve, reject) => {
            const req = http.get(`${this.baseUrl}:${this.basePort}/${apiEndpoint}/${this.assembleOptions(values)}`, res => {
                res.on('data', data => {
                    resolve(data);
                })
            });

            req.on('error', error => {
                reject(error);
            });

            req.end();
        })
    }

    assembleOptions(options) {
        var returnValue = "";
        options.forEach(t => {
            returnValue = `${returnValue}/${t}`;
        });

        return returnValue.slice(1);
    }
}