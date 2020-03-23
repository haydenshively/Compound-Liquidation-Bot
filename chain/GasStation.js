const fetch = require('node-fetch');

let url = process.env.GAS_STATION_ENDPOINT;
let params = {
  method: 'GET',
};

exports.gasPrice = async() => {
  const res = await fetch(url, params);
  const json = await res.json();

  return json;
};
