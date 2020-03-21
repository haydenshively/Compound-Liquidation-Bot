const Contract = require('../Contract.js');
import COMPTROLLERABI from './abis/comptroller.json';

class Comptroller extends Contract {
  // Enters the markets corresponding to cTokens (SEND -- uses gas)
  // Markets must be entered before a user can supply/borrow
  // cTokens: an array of type Token (specifies the markets to enter)
  // withWallet: the wallet that will enter the market
  // RETURNS true on success, otherwise false
  async enterMarketsFor(cTokens, withWallet) {
    const status = await this.contract.methods.enterMarkets(cTokens.map((x) => x.contract)).send({
      from: withWallet,
    });
    if (status === 0) {
      return true;
    }else {
      console.log('Error @Comptroller.enterMarketsFor -- ' + status.toString());
      console.log('--> cTokens: ' + cTokens.toString());
      console.log('--> Wallet: ' + withWallet.toString());
      return false;
    }
  }

  // Opposite of enterMarketsFor (SEND -- uses gas)
  // cToken: type Token (specifies the market to exit)
  // withWallet: the wallet that will exit the market
  // RETURNS true on success, otherwise false
  async exitMarketFor(cToken, withWallet) {
    const status = await this.contract.methods.exitMarket(cToken.contract).send({
      from: withWallet,
    });
    if (status === 0) {
      return true;
    }else {
      console.log('Error @Comptroller.exitMarket -- ' + status.toString());
      console.log('--> cToken: ' + cToken.toString());
      console.log('--> Wallet: ' + withWallet.toString());
      return false;
    }
  }
}

exports.Comptroller = Comptroller;
exports.mainnet = new Comptroller(
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
  JSON.parse(COMPTROLLERABI.result),
);