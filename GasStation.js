const fetch = require('node-fetch');

let url = process.env.GAS_STATION_ENDPOINT;
let settings = { method: "Get" };

fetch(url, settings)
  .then(res => res.json())
  .then((json) => {
    // do something with JSON
  });

exports.gasPrice = async () => {
  const atest = await fetch(url, settings).then(res => res.json()).then((json) => {
    console.log(json);
    return json;
  });
  console.log(atest.fastest/10.0);
};