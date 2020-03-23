// Project Level
require('dotenv').config();
// Scripting
const ProcessAddress = require('./ProcessAddress.js');

let minutes = 5, the_interval = minutes * 60 * 1000;
setInterval(function() {
  ProcessAddress.processUnhealthyAccounts().then((result) => {
    console.log(result);
  });
}, the_interval);
