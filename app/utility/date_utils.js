const moment = require('moment');
var config = require('../../app/config/db.config.js');

function asUTCDate(str_datetime) {
  const utcDate1 = new Date(str_datetime);    // 2021-12-12 01:01
  let diff = utcDate1.getTimezoneOffset();
  let timestamp=utcDate1.getTime()-diff*60*1000;
  utc_date = new Date(timestamp).toUTCString();
  return utc_date;
}

function defaultDate(afterMonth) {
  // let utcDate1 = new Date();    // 2021-12-12 01:01
  const date1 = new Date().toLocaleString('en-US', {
      timeZone: config.timezone
    });
  let utcDate1 = new Date(date1)
  utcDate1.setMonth(utcDate1.getMonth() + afterMonth);
  let diff = utcDate1.getTimezoneOffset();
  let timestamp=utcDate1.getTime()-diff*60*1000;
  utc_date = new Date(timestamp);  
  return utc_date;
}

function toLocalDate(utc_date) {  
  const utcDate1 = new Date(utc_date);    // 2021-12-12 01:01
  let diff = utcDate1.getTimezoneOffset();
  let timestamp=utcDate1.getTime() + 480*60*1000;
  local_date = new Date(timestamp); //.toUTCString();
  var year = local_date.getFullYear();
  var month = local_date.getMonth() + 1; // getMonth() is zero-based
  var day = local_date.getDate();
  var hour = local_date.getHours();
  var minute = local_date.getMinutes();
  
  var str_date = [[year,
      (month>9 ? '' : '0') + month,
      (day>9 ? '' : '0') + day
    ].join('-'),
    [(hour>9 ? '' : '0') + hour,
      (minute>9 ? '' : '0') + minute
    ].join(':')
    ].join(" ");
  return str_date;
}

function getDatenow(){
  const date1 = new Date().toLocaleString('en-US', {
      timeZone: config.timezone
    });
  let utcDate1 = new Date(date1);
  var year = utcDate1.getFullYear();
  var month = utcDate1.getMonth() + 1; // getMonth() is zero-based
  var day = utcDate1.getDate();
  var hour = utcDate1.getHours();
  var minute = utcDate1.getMinutes();
  var str_date = [[year,
          (month>9 ? '' : '0') + month,
          (day>9 ? '' : '0') + day
         ].join('-'),
         [(hour>9 ? '' : '0') + hour,
          (minute>9 ? '' : '0') + minute
         ].join(':')
         ].join(" ");
  return str_date;
}

function getLocalDatenow(){
  const date1 = new Date().toLocaleString('en-US', {
      timeZone: config.local_timezone
    });
  let utcDate1 = new Date(date1);
  var year = utcDate1.getFullYear();
  var month = utcDate1.getMonth() + 1; // getMonth() is zero-based
  var day = utcDate1.getDate();
  var hour = utcDate1.getHours();
  var minute = utcDate1.getMinutes();
  var str_date = [[year,
          (month>9 ? '' : '0') + month,
          (day>9 ? '' : '0') + day
         ].join('-'),
         [(hour>9 ? '' : '0') + hour,
          (minute>9 ? '' : '0') + minute
         ].join(':')
         ].join(" ");
  return str_date;
}

module.exports = {
  asUTCDate: asUTCDate,
  getDatenow: getDatenow,
  defaultDate: defaultDate,
  getLocalDatenow: getLocalDatenow,
  toLocalDate: toLocalDate
}