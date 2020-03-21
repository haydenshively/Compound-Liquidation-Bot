require('dotenv').config();
// const GasStation = require('./GasStation.js');
const Tokens = require('./compound/Tokens.js');

// GasStation.gasPrice();

Tokens.mainnet.cDAI.exchangeRate().then((result) => {
  console.log('cDAI Exchange Rate');
  console.log(result);
  console.log('');
});

Tokens.mainnet.cDAI.borrowRate().then((result) => {
  console.log('cDAI Borrow Rate');
  console.log(result);
  console.log('');
});

Tokens.mainnet.cDAI.supplyRate().then((result) => {
  console.log('cDAI Supply Rate');
  console.log(result);
  console.log('');
});

Tokens.mainnet.cDAI.cUnitsInCirculation().then((result) => {
  console.log('cDAI In Circulation');
  console.log(result);
  console.log('');
});

Tokens.mainnet.cDAI.uUnitsInContract().then((result) => {
  console.log('DAI In Contract');
  console.log(result);
  console.log('');
});

Tokens.mainnet.cDAI.uUnitsLoanedOut().then((result) => {
  console.log('DAI Gross Borrow');
  console.log(result);
  console.log('');
});

Tokens.mainnet.cDAI.uUnitsInContractFor(process.env.PUBLIC_KEY).then((result) => {
    console.log('Hayden\'s Supplied Dai');
    console.log(result);
    console.log('');
});

Tokens.mainnet.cDAI.uUnitsLoanedOutTo(process.env.PUBLIC_KEY).then((result) => {
    console.log('Hayden\'s Borrowed Dai');
    console.log(result);
    console.log('');
});

Tokens.mainnet.cDAI.withdraw_uUnits(1e18, process.env.PUBLIC_KEY);
// Tokens.mainnet.cDAI.withdraw_cUnits(1, process.env.PUBLIC_KEY);
// Tokens.mainnet.cDAI.supply_uUnits(1, process.env.PUBLIC_KEY);