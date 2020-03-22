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
  const res = await fetch(/*url*/'https://api.compound.finance/api/v2' + '/ctoken', params);
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
  const ethPrices = await exports.underlyingEthPrices();

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
    console.log(page);
  } while (page < totalPages);

  const unhealthyAccounts = accounts.filter(acct => acct.health && acct.health.value < 1.0);
  console.log('Log @unhealthyAccounts: Found ' + unhealthyAccounts.length.toString());
  const leastHealthy = unhealthyAccounts[2];
  console.log('Log @unhealthyAccounts: Least healthy');
  console.log('--> Address: ' + leastHealthy.address);
  console.log('--> Health: ' + leastHealthy.health.value);
  console.log('--> Total Supply Eth: ' + leastHealthy.total_collateral_value_in_eth.value);
  console.log('--> Total Borrow Eth: ' + leastHealthy.total_borrow_value_in_eth.value);
  leastHealthy.tokens.forEach((token) => {
    console.log('--> Token ' + token.symbol + ' ' + token.address);
    if (token.borrow_balance_underlying.value > 0) {
      console.log('----> Borrow uUnits: ' + token.borrow_balance_underlying.value);
      console.log('------> Closable (in uUnits): ' + closeFactor*token.borrow_balance_underlying.value);
      console.log('------> Closable (in Eth): ' + closeFactor*token.borrow_balance_underlying.value*ethPrices[token.symbol]);
    }
    if (token.supply_balance_underlying.value > 0) {
      const supply_uUnits = token.supply_balance_underlying.value;
      console.log('----> Supply (in uUnits): ' + supply_uUnits);
      const supply_uUnits_Eth = token.supply_balance_underlying.value * ethPrices[token.symbol];
      console.log('----> Supply (in Eth): ' + supply_uUnits_Eth);
      const totalSeizureCloseAmount_Eth = supply_uUnits_Eth / liquidIncent;
      console.log('----> Total Seizure Closing Amount (in Eth): ' + totalSeizureCloseAmount_Eth);
      const totalSeizureProfit_Eth = supply_uUnits_Eth * (liquidIncent - 1);
      console.log('------> Total Seizure Profit (in Eth), assuming no gas fees: ' + totalSeizureProfit_Eth);
      const maxGasAmountMaintainingProfit = totalSeizureProfit_Eth / 0.000000001;// Assuming gas price of 1 gwei
      console.log('------> Total Seizure Max Gas, assuming price = 1 gwei: ' + maxGasAmountMaintainingProfit);
    }
    console.log('');
  });

  console.log('Log @unhealthyAccounts: Liquidation incentive = ' + liquidIncent);





  // let accounts = [];
  //
  // if ((error === null) || (error === 0)) {
  //   console.log(pagination);
  //   for (let page = 2; page < pagination.total_pages; page++) {
  //     params.page_number = page;
  //   }
  //
  //
  // }else {
  //   console.log(error);
  // }
};

exports.unhealthyAccounts();