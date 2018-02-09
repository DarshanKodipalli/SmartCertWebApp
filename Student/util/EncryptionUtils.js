
var nodeRSA = require('node-rsa');
var crypto = require('crypto'),
fs = require('fs'),
path = require('path');

//dynamically generated key for each transaction
//256-bit AES dynamic session key which is to be encrypted
//IMPORTANT: Errors may arise due to initialization Vector

//return JSON object {skey:,encryptedSkey:,encryptedPid:,hmac:}
module.exports.encryptPid = function encryptPID(pid){
	console.log(pid.toString());
    var Skey = crypto.randomBytes(32);   //256 bits
    var initializationVector = crypto.randomBytes(16);
    var returnData = {};
    returnData.skey = Skey;
    var cipher = crypto.createCipheriv('aes-256-ecb', Skey,"");
    cipher.setAutoPadding(true);
    var encryptedPid = cipher.update(pid,'utf8','base64');
    encryptedPid += cipher.final('base64');
    console.log("\nECB Cipher\n");
    console.log(encryptedPid);
    returnData.encryptedPid = encryptedPid;

    returnData.hmac = createHmac(Skey,pid);
    returnData.encryptedSkey = encryptWithPublicKey(Skey);

    return returnData;
};

function createHmac(skey,pid){
	var s3 = crypto.createHash('sha256');
	var hash = s3.update(pid).digest("base64");
	console.log(hash.toString());
	console.log("\nHASH\n");
	console.log(hash);
	var cipher = crypto.createCipheriv('aes-256-ecb', skey,"");
    cipher.setAutoPadding(true);
    var encryptedPid = cipher.update(hash,'base64','base64');
    encryptedPid += cipher.final('base64');
    return encryptedPid;
    /*hmac.update(pid);
    var hmac = hmac.digest('base64');
    return hmac;*/
};

//timestamp should be in the format YYYY-MM-DDThh:mm:ss (ISO 8601) standard
//take the unix time as the input
function formatTimeStamp(unixTimeStamp){
    //In this case, server is making the stamp, normally device should create the stamp on capturing of data
    var date = new Date(unixTimestamp * 1000);

    var hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate();

    //formatting to YYYY-MM-DDThh:mm:ss
    var formattedStamp = year+"-"+(month+1<10?"0":"")+(month+1)+"-"+
        (day<10?"0":"")+day+"T"+(hours<10?"0":"")+hours+":"+
        (minutes<10?"0":"")+minutes+":"+(seconds<10?"0":"")+seconds;
    console.log(format);

    return formattedStamp;
}

function encryptWithPublicKey(skey)
{
    //lodaing PEM public key
    //if certificate changes be sure to change this according to the new public key
	var file = path.join(__dirname, '/..', "templates/cert.key.pem");
    var publicKey = fs.readFileSync(file);
    var obj = {key:publicKey.toString(),padding:crypto.constants.RSA_PKCS1_PADDING};
    console.log("Public Key");
    console.log(publicKey.toString("base64"));
    console.log("\nPublic Key");
    var buffer = new Buffer(skey);
    var encrypted = crypto.publicEncrypt(obj, buffer);
    return encrypted.toString("base64");
}