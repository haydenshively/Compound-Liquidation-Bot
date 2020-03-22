require('dotenv').config();
const Tokens = require('./compound/Tokens.js');
const Comptroller = require('./compound/Comptroller.js');

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

// Tokens.mainnet.cDAI.withdraw_uUnits(1, process.env.PUBLIC_KEY);
// Tokens.mainnet.cDAI.supply_uUnits(1, process.env.PUBLIC_KEY);
// Tokens.mainnet.cDAI.liquidate_uUnits('0xa62fdc2b9e7e64bc9e8e39aeba4e4fb4cca58aec',1e-16, Tokens.mainnet.cDAI.address, process.env.PUBLIC_KEY);

Comptroller.mainnet.liquidationIncentive().then((result) => {
  console.log('Compound Liquidation Incentive');
  console.log(result);
  console.log('');
});

Comptroller.mainnet.closeFactor().then((result) => {
  console.log('Compound Close Factor');
  console.log(result);
  console.log('');
});

Comptroller.mainnet.collateralFactorFor(Tokens.mainnet.cDAI).then((result) => {
  console.log('cDAI Collateral Factor');
  console.log(result);
  console.log('');
});

Comptroller.mainnet.marketsEnteredBy(process.env.PUBLIC_KEY).then((result) => {
  console.log('Hayden\'s Active Markets');
  console.log(result);
  console.log('');
});

Comptroller.mainnet.accountLiquidityOf(process.env.PUBLIC_KEY).then((result) => {
  console.log('Hayden\'s Account Liquidity and Shortfall (in Eth)');
  console.log(result);
  console.log('');
});

// Comptroller.mainnet.enterMarketsFor([
//   Tokens.mainnet.cBAT,
//   Tokens.mainnet.cREP,
//   Tokens.mainnet.cSAI,
//   Tokens.mainnet.cZRX,
//   Tokens.mainnet.cWBTC,
// ], process.env.PUBLIC_KEY);
