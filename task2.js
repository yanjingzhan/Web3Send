const { parentPort } = require('worker_threads');
const Web3 = require('web3');
const config = require('./configs/config.json');
const erc20ABI = require(config.erc20ABI);

const web3 = new Web3(new Web3.providers.HttpProvider('https://icy-red-sky.bsc.quiknode.pro/8394beb84862cf3b8914451c6b6245bc11093bba/'));

var from2 = web3.eth.accounts.privateKeyToAccount('The-strongest-curse-you-will-be-killed-on-this-night-zero-oclock');


async function send(from, nonce, gasPrice) {
    const tx = {
        nonce: nonce,
        from: from.address,
        to: '0x61a422eb02e30A580dC890E656a1ed1CC03d99d1',
        value: 0,
        gas: 200000,
        gasPrice: gasPrice,
        // data: contract.methods.transfer(
        //     web3.utils.toChecksumAddress("0x62cb2C58Ed7F72ff1904a102052AA73598343bb7"),
        //     (web3.utils.toWei("0.1", 'ether'))
        // ).encodeABI()
        data: "0xa9059cbb00000000000000000000000062cb2c58ed7f72ff1904a102052aa73598343bb7000000000000000000000000000000000000000000000000016345785d8a0000"
    }

    // parentPort.postMessage(JSON.stringify(tx));

    const signedTx = await from2.signTransaction(tx);
    web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

async function onlySendTransaction(tx){
   web3.eth.sendSignedTransaction(tx);
}


parentPort.on('message', (task) => {
    // send(from2, task.nonce, task.gasPrice);

    onlySendTransaction(task.tx);
    // parentPort.postMessage(task.a + task.b);
});
