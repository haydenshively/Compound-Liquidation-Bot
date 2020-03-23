const fetch = require('node-fetch');

let url = process.env.ETHPLORER_ENDPOINT;
let params = {
  method: 'GET',
};

exports.balancesFor = async(wallet) => {
  const res = await fetch(url + '/getAddressInfo/' + wallet + '?apiKey=freekey', params);
  const json = await res.json();

  let balances = {};
  balances['ETH'] = json.ETH.balance;

  const tokens = json.tokens;
  tokens.forEach((token) => {
    const decimals = token.tokenInfo.decimals.toString();
    balances[token.tokenInfo.symbol] = token.balance / Number('1e' + decimals);
  });

  return balances;
};
