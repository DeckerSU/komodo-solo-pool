require('dotenv').config();

const requiredEnvVars = [
    'COIN',
    'REWARDS_ADDRESS',
    'STRATUM_HIGH_DIFF_PORT',
    'STRATUM_LOW_DIFF_PORT',
    'DAEMON_HOST',
    'DAEMON_RPC_PORT',
    'DAEMON_RPC_USER',
    'DAEMON_RPC_PASS',
    'DAEMON_P2P_PORT'
  ];
  
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.error(`Error: Missing required environment variable ${envVar}`);
      process.exit(1);
    }
  });

var Stratum = require('stratum-pool');

var myCoin = {
    "name": process.env.COIN,
    "symbol": process.env.COIN,
    "algorithm": "equihash",
    "txfee": 0.00005
};

var pool = Stratum.createPool({

    "coin": myCoin,

    "address": process.env.REWARDS_ADDRESS, // Address to where block rewards are given

    "jobRebroadcastTimeout": 55,
    "connectionTimeout": 600,
    "emitInvalidBlockHashes": false,
    "tcpProxyProtocol": false,

    "banning": {
        "enabled": false,
        "time": 600,
        "invalidPercent": 50,
        "checkThreshold": 500,
        "purgeInterval": 300
    },

    "ports": {
        [process.env.STRATUM_HIGH_DIFF_PORT]: {
            "tls": false,
            "diff": 272
        },
        [process.env.STRATUM_LOW_DIFF_PORT]: {
            "tls": false,
            "diff": 1
        },
    },

    "daemons": [
        {
            "host": process.env.DAEMON_HOST,
            "port": parseInt(process.env.DAEMON_RPC_PORT),
            "user": process.env.DAEMON_RPC_USER,
            "password": process.env.DAEMON_RPC_PASS
        }
    ],

    "p2p": {
        "enabled": false,
        "host": process.env.DAEMON_HOST,
        "port": parseInt(process.env.DAEMON_P2P_PORT),
        "disableTransactions": true
    }

}, function(ip, port, workerName, password, callback){
    console.log("Authorize " + workerName + ":" + password + "@" + ip);
    callback({
        error: null,
        authorized: true,
        disconnect: false
    });
});

pool.on('share', function(isValidShare, isValidBlock, data){
    if (isValidBlock)
        console.log('Block found');
    else if (isValidShare)
        console.log('Valid share submitted' + ' [' + data.shareDiff + '/' + data.blockDiff + ']');
    else if (data.blockHash)
        console.log('We thought a block was found but it was rejected by the daemon');
    else
        console.log('Invalid share submitted');
});

pool.on('log', function(severity, text){
    console.log('[' + severity + '] ' + text);
});

pool.start();
