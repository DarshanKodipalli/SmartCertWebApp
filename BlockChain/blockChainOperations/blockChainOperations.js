var MerkleTools = require('merkle-tools'),
	sysConfig     = require('../config/config'),
	util = require("../utils/utils"),
	chainpoint = require('chainpoint-validate');

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(sysConfig.ethNodeEndpoint));
web3.eth.defaultAccount = web3.eth.accounts[sysConfig.defaultAccount];
var abi = web3.eth.contract(sysConfig.abiCode);
smartCertContract = abi.at(sysConfig.contractAddr);


var generateMerkleTree = function(data){
	var merkleTree = new MerkleTools({hashType : 'sha256'});
	for(var i = 0;i< data.length;i++){
		merkleTree.addLeaf(util.getHash(JSON.stringify(data[i])));
	}
	return merkleTree;
};

var addProof = function(certFileName,data){
	var certificateEvent = smartCertContract.CertificateAddress();
	var participantAddress = data.participantAddress;
	var batchAddress = data.batchAddress;
	var certName = data.description||"Certificate";
	if(!certFileName){
		return;
	}
    certificateEvent.watch(function(err, result) {
        var certFileName = result.args.certFileName || '';
        console.log('Result Event: ' + JSON.stringify(result));
        var timestamp = Date.now();
        var batchAddr = result.args.batchAddr || '';
        var partAddr = result.args.participant || '';
        var certAddr = result.args.certificate || '';
        var issueCertificateContractMethod = smartCertContract.issueCertificate;
        var gasEstimation = issueCertificateContractMethod.estimateGas(batchAddr, partAddr, certAddr, timestamp);
        web3.eth.getBlock('latest', function(err, block) {
            var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
            if (gasEstimation > gasLimit) {
                console.log('Gas required exceeds limit: ' + gasLimit);
            }
            if (gasEstimation > blockGasLimit) {
                console.log("Estimated Gas: " + gasEstimation);
                console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
            }
            smartCertContract.issueCertificate.sendTransaction(batchAddr, partAddr, certAddr, timestamp, {
                    from: web3.eth.accounts[sysConfig.defaultAccount],
                    gas: gasEstimation
                },
                function(issueErr, issueResult) {
                    if (!issueErr) {
                        console.log("issue certificate mined in blockchain at " + issueResult); // attach transactionhash
                        // send transaction Id back to issuer and student
                        //active MQ or Socket IO
                    } else {
                    	console.log("issue error");
                    }
                });

        });
    });
    var certificateContractMethod = smartCertContract.createCertificate;
    var gasEstimation = certificateContractMethod.estimateGas(batchAddress, certName, true, true, participantAddress, certFileName);
    web3.eth.getBlock('latest', function(err, block) {
        var blockGasLimit = Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024);
        if (gasEstimation > gasLimit) {
            console.log('Gas required exceeds limit: ' + gasLimit);
        }
        if (gasEstimation > blockGasLimit) {
            console.log("Estimated Gas: " + gasEstimation);
            console.log('Gas required exceeds block gas limit: ' + blockGasLimit);
        }
        smartCertContract.createCertificate.sendTransaction(batchAddress, certName, true, true, participantAddress, certFileName, {
            from: web3.eth.accounts[sysConfig.defaultAccount],
            gas: gasEstimation
        });
    });
};

var finishBatch = function(transactionId, tree, data) {
    var merkleProof = {
        "@context": "https://w3id.org/chainpoint/v2",
        type: "ChainpointSHA256v2",
        merkleRoot: tree.getMerkleRoot().toString('hex'),
        targetHash: '',
        proof: '',
        anchors: [{
            sourceId: transactionId.slice(2, transactionId.length),
            type: "ETHData"
        }]
    };
    for (var i = 0; i < tree.getLeafCount(); i++) {
        var proof = tree.getProof(i),
            hash = tree.getLeaf(i).toString('hex');
        merkleProof.targetHash = hash;
        merkleProof.proof = proof;
        data[i].proof = merkleProof;
        addProof(data);
    }
};

exports.issueCertificateOnBlockChain = function (certificate) {
	if(!certificate.certificate||
		!certificate.universityAddress||
		!certificate.participantAddress||
		!certificate.courseAddress||
		!certificate.batchAddress){
		return;
	}
	var data = [];
	data.push(certificate);
	var tree = generateMerkleTree(data);
	var merkleRoot = tree.getMerkleRoot().toString('hex');
	web3.eth.sendTransaction({
		from:web3.eth.accounts[sysConfig.defaultAccount],
		to:web3.eth.accounts[sysConfig.defaultAccount],
		value:web3.toWei(100,'finney'),
		data:web3.toHex(merkleRootHash)
	}, function (e, contract){
		if(contract){
			console.log('Transaction id is '+contract);
			console.info('Finishing batch process with txid'+contract);
			finishBatch(contract,tree,data);
		}else{
			console.log('Certificate issuing failed');
		}
	});
};

exports.verifyCertificateById = function(data,callback){
	var certificateId = data.certificate.certificateAddress;
	var studentId = data.studentAddress;
	smartCertContract.verifyCertificate.call(studentId, certificateId, function(err, result){
		if(err){
			console.log('problem in fetching smart contract data');
		}
		else if(result)
		{
			var merkleProof = JSON.parse(data.certificate.proof);
			var transaction = web3.eth.getTransaction('0x'+merkleProof.anchors[0].sourceId);
			validateReceipt(transaction,function(flag){
				if(flag){
					if(expectedRoot === actualRoot && expectedhash === certificateHash){
						callback(true);
					}
					else{
						callback(false);
					}
				}
				else{
					callback(false);
				}
			});

		}else{
			console.log('The certificate data is not present in smart contract');
			res.json({message:"failure"});
		}
	});
};
var validateReceipt = function(data,callback){
	var chainpoint = new ChainPoint();
		receipt = chainpoint(data, true, function (err, result) {
		if(err) {
			this.status = StepStatus.failed;
			console.log('validate error'+JSON.stringify(result));
		} else {
			console.log('validate success'+JSON.stringify(result));
			if(result.isValid){
				var txR = web3.eth.getTransactionReceipt('0x'+result.anchors[0].sourceId);
				if (txR && txR.blockNumber === null){
					this.status = StepStatus.failed;
					callback(false);
					console.log("transaction receipt not found");
				}else{
					callback(true);
				}
			} else {
				this.status = StepStatus.failed;
				callback(false);
			}
		}
	});
};