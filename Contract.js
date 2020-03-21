const Web3 = require('web3');

// TODO does this code get run once, or on every import/require
global.web3 = new Web3(process.env.WEB3_ENDPOINT);
const account = web3.eth.accounts.privateKeyToAccount('0x'+process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

class Contract {
  constructor(address, abi) {
    this.address = address;
    this.abi = abi;
    this.contract = new web3.eth.Contract(this.abi, this.address);
  }
}

module.exports = Contract;