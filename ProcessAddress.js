// Compound
const Tokens = require('./compound/Tokens.js');
const Comptroller = require('./compound/Comptroller.js');
const Compound = require('./compound/API.js');
// Chain
const Etherscan = require('./chain/Etherscan.js');
const Ethplorer = require('./chain/Ethplorer.js');
const GasStation = require('./chain/GasStation.js');


exports.process = async(myBalances, underlyingEthPrices, account) => {
  const closeFactor = await Comptroller.mainnet.closeFactor();
  const liquidIncent = await Comptroller.mainnet.liquidationIncentive();

  const address = account.address;
  const health = account.health ? account.health.value : 100.0;
  console.log('Log @process: Analyzing Account');
  console.log('--> Address: ' + address);
  console.log('--> Health: ' + health);

  let bestAssetToClose = null;
  let bestAssetToSeize = null;
  let closingAmountEth_borrow = 0.0;
  let closingAmountEth_supply = 0.0;

  const tokens = (account.tokens) ? account.tokens : [];
  console.log('Log @process: Searching for best asset to close');
  tokens.forEach((token) => {
    const tokenAddress = token.address;
    const tokenSymbol = token.symbol;
    // console.log('--> Token ' + tokenSymbol + ' ' + tokenAddress);

    const borrow_uUnits = (token.borrow_balance_underlying) ? token.borrow_balance_underlying.value : 0.0;
    if (borrow_uUnits > 0) {
      // console.log('----> Borrow (in uUnits): ' + borrow_uUnits);
      const borrow_Eth = borrow_uUnits * underlyingEthPrices[tokenSymbol];
      // console.log('----> Borrow (in Eth): ' + borrow_Eth);
      let closable_Eth = borrow_Eth * closeFactor;
      // console.log('------> Closable by Market (in Eth): ' + closable_Eth);
      closable_Eth = Math.min(closable_Eth, myBalances[tokenSymbol.substring(1)] * underlyingEthPrices[tokenSymbol]);
      // console.log('------> Closable by Me (in Eth):     ' + closable_Eth);

      if (closable_Eth > closingAmountEth_borrow) {
        // console.log('****> Now the winner!');
        closingAmountEth_borrow = closable_Eth;
        bestAssetToClose = token;
      }
    }
  });

  if (bestAssetToClose === null) return 0.0;
  if (bestAssetToClose.symbol === 'cETH') return 0.0;// TODO something is broken here

  console.log('Log @process: Searching for best asset to seize');
  tokens.forEach((token) => {
    const tokenAddress = token.address;
    const tokenSymbol = token.symbol;
    // console.log('--> Token ' + tokenSymbol + ' ' + tokenAddress);

    const supply_uUnits = (token.supply_balance_underlying) ? token.supply_balance_underlying.value : 0.0;
    if (supply_uUnits > 0) {
      // console.log('----> Supply (in uUnits): ' + supply_uUnits);
      const supply_Eth = supply_uUnits * underlyingEthPrices[tokenSymbol];
      // console.log('----> Supply (in Eth): ' + supply_Eth);
      const closable_Eth = supply_Eth / liquidIncent;
      // console.log('------> Seizable by Market (in Eth): ' + closable_Eth);

      // Aim to seize the token with the smallest sufficient balance
      if ((closable_Eth > closingAmountEth_borrow) && (closingAmountEth_supply > closingAmountEth_borrow)) {
        if (closable_Eth < closingAmountEth_supply) {
          // console.log('****> Now the winner!');
          closingAmountEth_supply = closable_Eth;
          bestAssetToSeize = token;
        }
      }
      else if (closable_Eth > closingAmountEth_supply) {
        // console.log('****> Now the winner!');
        closingAmountEth_supply = closable_Eth;
        bestAssetToSeize = token;
      }
    }
  });

  if (bestAssetToSeize === null) return 0.0;

  const closingAmount_Eth = Math.min(closingAmountEth_borrow, closingAmountEth_supply);
  // console.log('Log @process: Found best possible close/seize combination');
  // console.log('--> Should liquidate ' + bestAssetToClose.symbol);
  // console.log('----> Amount (in Eth): ' + closingAmount_Eth);
  // console.log('--> Should seize ' + bestAssetToSeize.symbol);

  const expectedProfitNoFees = closingAmount_Eth * (liquidIncent - 1.0);
  const maxGasMaintainingProfit = expectedProfitNoFees / 0.0000000035;// Assuming gas price of 3.5 gwei
  console.log('Log @process: Potential profit is ' + expectedProfitNoFees + ' ETH');
  console.log('--> Can use up to ' + maxGasMaintainingProfit + ' gas, assuming price = 3.5 gwei');

  // TODO parameterize this threshold as well as assumed gas price
  if (maxGasMaintainingProfit > 900000) {
    console.log('Log @process: Going for it!');

    let symbolClose = bestAssetToClose.symbol;
    symbolClose = symbolClose.charAt(0).toLowerCase() + symbolClose.substring(1);
    const closingAmount_uUnits = closingAmount_Eth / underlyingEthPrices[bestAssetToClose.symbol];

    Tokens.mainnet[symbolClose].liquidate_uUnits(address, closingAmount_uUnits, bestAssetToSeize.address, process.env.PUBLIC_KEY);
    return expectedProfitNoFees;
  }else {
    return 0.0;
  }
};

exports.processUnhealthyAccounts = async () => {
  const myBalances = await Ethplorer.balancesFor(process.env.PUBLIC_KEY);
  console.log('Log @processUnhealthyAccounts: My Balances');
  console.log(myBalances);
  // const gasPrices = await GasStation.gasPrice();
  // console.log('Log @process: Gas Prices - ' + gasPrices.toString());
  const underlyingEthPrices = await Compound.underlyingEthPrices();
  console.log('Log @processUnhealthyAccounts: Eth Prices');
  console.log(underlyingEthPrices);

  let expectedProfitNoFees = 0.0;

  const accounts = await Compound.unhealthyAccounts();
  for (const account of accounts) {
    expectedProfitNoFees += await exports.process(myBalances, underlyingEthPrices, account);
  }

  return expectedProfitNoFees;
};