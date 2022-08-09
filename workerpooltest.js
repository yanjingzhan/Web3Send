const WorkerPool = require('./WorkerPool.js');
const os = require('os');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('https://api.dognode.com/bsc/e48d0e15458d95c1c5b50ea96bca8225'));

var from2 = web3.eth.accounts.privateKeyToAccount('The-strongest-curse-you-will-be-killed-on-this-night-zero-oclock');


const poolCount = 20;
const pool = new WorkerPool(poolCount);


async function getNonce() {
    nonce = parseInt(await web3.eth.getTransactionCount(from2.address));
    return nonce;
}

async function getGasPrice() {
    gasPrice = await web3.eth.getGasPrice();
    return gasPrice;
}


async function getsend(from, nonce, gasPrice) {
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
    return (signedTx.rawTransaction);
}

async function main() {

    var nonce = await getNonce();
    var price = await getGasPrice();

    var txs = [];

    for (let i = 0; i < poolCount; i++) {
        var n = nonce + i;
        txs.push(await getsend(from2,n,price));
    }

    for (let i = 0; i < poolCount; i++) {   
        console.log(txs[i]);
    }

    let finished = 0;
    for (let i = 0; i < poolCount; i++) {
        pool.runTask({ nonce: nonce + i, gasPrice: price,tx:txs[i] }, (err, result) => {
            console.log(i, err, result);
            if (++finished === poolCount)
                pool.close();
        });
    }
}

main();

