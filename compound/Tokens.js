const Contract = require('../Contract.js');
const CBATABI = require('./abis/cbat.json');
const CDAIABI = require('./abis/cdai.json');
const CREPABI = require('./abis/crep.json');
const CSAIABI = require('./abis/csai.json');
const CUSDCABI = require('./abis/cusdc.json');
const CWBTCABI = require('./abis/cwbtc.json');
const CZRXABI = require('./abis/czrx.json');

class Token extends Contract {
  // Converts ordinary asset to the cToken equivalent (SEND -- uses gas)
  // amount: #tokens
  // inWallet: sends (#tokens) and receives (#ctokens = #tokens / exchange_rate)
  // Hayden Shively tested 3/21/20
  async supply_uUnits(amount, inWallet) {
    const hexAmount = web3.utils.toHex(amount * 1e18);
    const encodedMethod = this.contract.methods.mint(hexAmount).encodeABI();

    const tx = await this.txFor(encodedMethod, inWallet, 300000, 10 * 1e9);
    const signedTx = this.sign(tx);
    this.send(signedTx, 'Token.supply_uUnits');
  }

  // Converts the cToken to its ordinary asset equivalent (SEND -- uses gas)
  // amount: #ctokens
  // inWallet: sends (#ctokens) and receives (#tokens <= #ctokens * exchange_rate)
  // CAUTION: #tokens <= #ctokens * exchange_rate <= account_liquidity <= market_liquidity
  // Hayden Shively tested 3/21/20
  async withdraw_cUnits(amount, inWallet) {
    const hexAmount = web3.utils.toHex(amount * 1e18);
    const encodedMethod = this.contract.methods.redeem(hexAmount).encodeABI();

    const tx = await this.txFor(encodedMethod, inWallet, 9000000, 10 * 1e9);
    const signedTx = this.sign(tx);
    this.send(signedTx, 'Token.withdraw_cUnits');
  }

  // Just like withdraw_cUnits, but amount is in units of the ordinary asset (SEND -- uses gas)
  // Hayden Shively tested 3/21/20
  async withdraw_uUnits(amount, inWallet) {
    const hexAmount = web3.utils.toHex(amount * 1e18);
    const encodedMethod = this.contract.methods.redeemUnderlying(hexAmount).encodeABI();

    const tx = await this.txFor(encodedMethod, inWallet, 9000000, 10 * 1e9);
    const signedTx = this.sign(tx);
    this.send(signedTx, 'Token.withdraw_uUnits');
  }

  // Performs liquidation (SEND -- uses gas)
  // borrower: account address of any user with negative account_liquidity
  // amount: the amount of debt to repay, in units of the ordinary asset
  // cTokenToSeize: an address of a cToken that the borrower holds as collateral
  // withWallet: the liquidator's wallet, from which funds will be withdrawn in order to pay debt
  // RETURNS true on success, otherwise false
  async liquidate_uUnits(borrower, amount, cTokenToSeize, withWallet) {
    const hexAmount = web3.utils.toHex(amount * 1e18);
    const encodedMethod = this.contract.methods.liquidateBorrow(borrower, hexAmount, cTokenToSeize).encodeABI();

    const tx = await this.txFor(encodedMethod, withWallet, 9000000, 10 * 1e9);
    const signedTx = this.sign(tx);
    this.send(signedTx, 'Token.liquidate_uUnits');
  }

  // Returns the current exchange_rate (CALL -- no gas needed)
  // exchange_rate = (uUnitsInContract() + uUnitsLoanedOut() - totalReserves()) / cUnitsInCirculation()
  async exchangeRate() {
    return (await this.contract.methods.exchangeRateCurrent().call()) / 1e18 / 1e10;
  }

  // Returns the current borrow rate per block (CALL -- no gas needed)
  async borrowRate() {
    return (await this.contract.methods.borrowRatePerBlock().call()) / 1e18;
  }

  // Returns the current supply rate per block (CALL -- no gas needed)
  async supplyRate() {
    return (await this.contract.methods.supplyRatePerBlock().call()) / 1e18;
  }

  // Returns the total amount of cTokens currently in circulation (CALL -- no gas needed)
  async cUnitsInCirculation() {
    return (await this.contract.methods.totalSupply().call()) * 1e10 / 1e18;
  }

  // Returns the total amount of ordinary asset that the contract owns (CALL -- no gas needed)
  async uUnitsInContract() {
    return (await this.contract.methods.getCash().call()) / 1e18;
  }

  // Returns the amount of ordinary asset that the wallet has placed in the contract (CALL -- no gas needed)
  async uUnitsInContractFor(wallet) {
    return (await this.contract.methods.balanceOfUnderlying(wallet).call()) / 1e18;
  }

  // Returns the total amount of ordinary asset that the contract has loaned out (CALL -- no gas needed)
  async uUnitsLoanedOut() {
    return (await this.contract.methods.totalBorrowsCurrent().call()) / 1e18;
  }

  // Returns the amount of ordinary asset that the contract has loaned out to borrower (CALL -- no gas needed)
  // ** includes interest **
  // borrower: account address of any user
  async uUnitsLoanedOutTo(borrower) {
    return (await this.contract.methods.borrowBalanceCurrent(borrower).call()) / 1e18;
  }
}

exports.Token = Token;
exports.mainnet = {
  cBAT: new Token('0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e', CBATABI),
  cDAI: new Token('0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', CDAIABI),
  cREP: new Token('0x158079ee67fce2f58472a96584a73c7ab9ac95c1', CREPABI),
  cSAI: new Token('0xf5dce57282a584d2746faf1593d3121fcac444dc', CSAIABI),
  cUSDC: new Token('0x39aa39c021dfbae8fac545936693ac917d5e7563', CUSDCABI),
  cWBTC: new Token('0xc11b1268c1a384e55c48c2391d8d480264a3a7f4', CWBTCABI),
  cZRX: new Token('0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407', CZRXABI),
};