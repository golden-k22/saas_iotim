const axios = require('axios');

exports.SendRequest=async (method, url, callback, data) =>{
    try {
        let response = await axios.request({
            method: method,
            url: url,
            data: data
        });
        // console.log(response.status);
        callback(response.data);
    } catch (err) {
        this.handleError("Operation Failed: Network Error");
    }
    // axios.request({
    //     method: method,
    //     url:url
    // }).then(response=>callback(response.data));
}