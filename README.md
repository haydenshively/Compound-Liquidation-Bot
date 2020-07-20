# Compound Liquidation Bot

This repository provides web3 boilerplate and the basic logic
necessary to profitably call `liquidateBorrow()` on cToken smart
contracts.

I've chosen to make it open source in the spirit of
decentralization... and also because I no longer use it. I now call
`liquidateBorrow()` from within a flash loan contract, which requires
more gas (and therefore higher transaction fees). *As such, I cannot
profitably liquidate low-value (< 0.5 Ξ) accounts. This code (sometimes) can.*

Support me by sending money for coffee: 0x321F954c22B9128BAac787C3241dae977cBBC2e0

## Installation

```shell script
npm install
```

You can also use yarn if you wish.

## Usage

```shell script
node main.js
```

You will also need to create a `.env` file with the
following information:

- `PUBLIC_KEY` your wallet's address
- `PRIVATE_KEY` your wallet's private key (for signing txs)
- `COMPOUND_ENDPOINT` https://api.compound.finance/api/v2
- `ETHPLORER_ENDPOINT` https://api.ethplorer.io
- `GAS_STATION_ENDPOINT` https://ethgasstation.info/json/ethgasAPI.json
- `WEB3_PROVIDER` could be Infura, your own node... anything

If you want to run this in Docker or on Google Cloud Platform,
I'm going to assume you know what you're doing. Configuration
files are available.

## How it works

Compound provides two very useful services: the Account
Service and the cToken Service. These services provide
information about all users and currencies currently on
the protocol. The code in `/compound/API.js` fetches and
processes this information before handing it off to
`main.js`.

`main.js` also has handlers that retrieve data about current
gas prices, close factors, the liquidation incentive, and
your wallet balance (for each token).

With all of that information in hand, it's easy to determine
whether a given user can be profitably liquidated. In pseudocode,
the idea is this:

```js
const user; // Item from array returned by AccountService API

let bestAssetToRepay = null;
let bestAssetToSeize = null;
let maxRepayable_Eth = 0.0;
let maxSeizable_Eth = 0.0;

user.tokens.forEach(token => {
  const repayable_Eth = token.borrowBalanceUnderlying * costInEth * closeFactor;
  const seizable_Eth = token.supplyBalanceUnderlying * costInEth / liquidationIncentive;

  if (
    repayable_Eth > maxRepayable_Eth &&
    seizable_Eth > maxSeizable_Eth
  ) {
    if (repayable_Eth <= maxSeizable_Eth) {
      // In this case, raising maxRepayable_Eth actually increases rewards
      // (maxSeizable_Eth is sufficient to maximize liquidation incentive)
      maxRepayable_Eth = repayable_Eth;
      bestAssetToRepay = token;
    } else {
      // In this case, raising maxRepayable_Eth wouldn't lead to increased rewards
      // so we increase maxSeizable_Eth instead
      maxSeizable_Eth = seizable_Eth;
      bestAssetToSeize = token;
    }
  } else if (repayable_Eth > maxRepayable_Eth) {
    maxRepayable_Eth = repayable_Eth;
    bestAssetToRepay = token;
  } else if (seizable_Eth > maxSeizable_Eth) {
    maxSeizable_Eth = seizable_Eth;
    bestAssetToSeize = token;
  }
  
  const amount = Math.min(maxRepayable_Eth, maxSeizable_Eth);
  const profitability = amount * (liquidationIncentive - 1.0);
  if (profitability > txFee && user.liquidity < 0) {
    bestAssetToRepay.liquidateBorrow(user.address, amount, bestAssetToSeize);
  }
});
```

## Disclaimer

*USE THIS CODE AT YOUR OWN RISK!* There's no warranty, and I can't promise
that you'll make money. Please do not trust random developers on the internet
(even me).
