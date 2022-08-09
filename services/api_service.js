const axios = require('axios');

module.exports = class ApiService {
    constructor(url, port) {
        this.baseUrl = url;
        this.basePort = port;
    }

    async connect(serialNumber) {
        return performGet('/api/Units/Connect', [ serialNumber ]);
    }

    // Base function to get data from a GET endpoint
    //      apiEndpoint: string in the format "api/<controller>/<endpoint-before-values>"
    //      options: array of values to be passed to endpoint in order that they will be received
    //
    // Returns an object with 'success' = true and the response data if the request is successful,
    //      'success' = false and error value if the request failed
    async performGet(apiEndpoint, options) {
        try {
            var response = await axios.get(`${this.baseUrl}:${this.basePort}/${apiEndpoint}/${this.assembleOptions(options)}`);

            if (response.status == 200) {
                return { success: true, data: response.data };
            } else if (response.status == 204) {
                return { success: true, data: response.status.toString() };
            }

            return { success: false, data: `Unknown status code: ${response.status}` };
        } catch (e) {
            return { success: false, data: e.message };
        }
    }

    // Base function to perform action on PUT endpoint
    //      apiEndpoint: string in the format "api/<controller>/<endpoint>"
    //      options: object to be passed to endpoint
    //
    // Returns an object with 'success' = true and the response data if the request is successful,
    //      'success' = false and error value if the request failed
    async performPut(apiEndpoint, options) {
        try {
            var response = await axios.put(`${this.baseUrl}:${this.basePort}/${apiEndpoint}`, options);
            
            if (response.status == 200) {
                return { success: true, data: response.data };
            } else if (response.status == 204) {
                return { success: true, data: response.status.toString() };
            }
            
            return { success: false, data: `Unknown status code: ${response.status}` };
        } catch (e) {
            return { success: false, data: e.message };
        }
    }

    // Base function to perform action on POST endpoint
    //      apiEndpoint: string in the format "api/<controller>/<endpoint>"
    //      options: object to be passed to endpoint
    //
    // Returns an object with 'success' = true and the response data if the request is successful,
    //      'success' = false and error value if the request failed
    async performPost(apiEndpoint, options) {
        try {
            var response = await axios.post(`${this.baseUrl}:${this.basePort}/${apiEndpoint}`, options);
            
            if (response.status == 200) {
                return { success: true, data: response.data };
            } else if (response.status == 204) {
                return { success: true, data: response.status.toString() };
            }
            
            return { success: false, data: `Unknown status code: ${response.status}` };
        } catch (e) {
            return { success: false, data: e.message };
        }
    }

    // Function to assemble an array of options into a string that can be appended
    //      to the end of a url for a GET request
    assembleOptions(options) {
        var returnValue = "";
        options.forEach(t => {
            returnValue = `${returnValue}/${t}`;
        });

        return returnValue.slice(1);
    }
}