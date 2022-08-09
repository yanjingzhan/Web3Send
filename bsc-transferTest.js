const Web3 = require('web3');
const axios = require('axios');
const config = require('./configs/config.json');
const erc20ABI = require(config.erc20ABI);

// const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed4.defibit.io'));
// const web3 = new Web3(new Web3.providers.HttpProvider('https://bitter-aged-glade.bsc.quiknode.pro/5106a25744a22ba53fccf372a9cebcb1a0786285/'));
const web3 = new Web3(new Web3.providers.HttpProvider('https://api.dognode.com/bsc/e48d0e15458d95c1c5b50ea96bca8225'));

var from2 = web3.eth.accounts.privateKeyToAccount('The-strongest-curse-you-will-be-killed-on-this-night-zero-oclock');

const contract = new web3.eth.Contract(erc20ABI);

async function getNonce() {
    nonce = parseInt(await web3.eth.getTransactionCount(from2.address));
    return nonce;
}

async function getGasPrice() {
    gasPrice = await web3.eth.getGasPrice();
    return gasPrice;
}


async function send(from, nonce, gasPrice) {
    const tx = {
        nonce: nonce,
        from: '0xA966bfD579518e796A83867c4604B725d9918AdD',
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

    console.log("加以：", JSON.stringify(tx));

    const signedTx = await from2.signTransaction(tx);
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    // try {
    //     const signedTx = await from2.signTransaction(tx);
    //     signedTxData = signedTx.rawTransaction;

    //     console.log("signedTxData", signedTx);
    //     await web3.eth.sendSignedTransaction(signedTxData)
    //         .on('receipt', function (result) {
    //             console.log("resule,", result);
    //         });
    // }
    // catch (err) {
    //     console.error;
    // }
}

async function main() {

    var count = 100;

    var nonce = await getNonce();
    var price = await getGasPrice();

    for (var i = 0; i < count; i++) {
        send(from2, nonce + i, price);
    }
}

// main();

async function pingNode() {
    console.time('getBlockNumber');
    var t = await web3.eth.getBlockNumber();
    console.log(`区块高度,${t}`);
    console.timeEnd('getBlockNumber');
}

async function nodespeed() {
    for (var i = 0; i < 1000; i++) {
        await pingNode();
    }
}

nodespeed();
