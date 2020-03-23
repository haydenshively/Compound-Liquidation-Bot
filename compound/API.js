const fetch = require('node-fetch');

let url = process.env.COMPOUND_ENDPOINT;
let params = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

exports.underlyingEthPrices = async() => {
  params['body'] = undefined;
  const res = await fetch(url + '/ctoken', params);
  const json = await res.json();

  let ethPrices = {};

  const error = json['error'];
  const tokens = json['cToken'];

  tokens.forEach((token) => {
    ethPrices[token.symbol] = token.underlying_price.value;
  });

  return ethPrices;
};

exports.unhealthyAccounts = async () => {
  let accounts = [];
  let closeFactor = 0;
  let liquidIncent = 0;
  let page = 1;
  let totalPages = 0;
  do {
    params['body'] = JSON.stringify({
      // 'addresses': [],
      // 'block_number': 0,
      // 'max_health[value]': '1.0',
      'page_number': page,
      'page_size': 100,
    });
    const res = await fetch(/*url*/'https://api.compound.finance/api/v2' + '/account', params);
    const json = await res.json();

    const error = json['error'];
    const pagination = json['pagination_summary'];
    closeFactor = json['close_factor'];
    liquidIncent = json['liquidation_incentive'];
    accounts = [...accounts, ...json['accounts']];

    if (accounts.some(acct => acct.health && acct.health.value > 1.0)) break;
    if (pagination) totalPages = pagination.total_pages;
    page++;
    console.log('Log @unhealthyAccounts: Loading page ' + page);
  } while (page < totalPages);

  const unhealthyAccounts = accounts.filter(acct => acct.health && acct.health.value < 1.0);
  console.log('Log @unhealthyAccounts: Found ' + unhealthyAccounts.length.toString());

  return unhealthyAccounts;
};
