var SignedXml = require('xml-crypto').SignedXml,
    FileKeyInfo = require('xml-crypto').FileKeyInfo,
    builder = require('xmlbuilder'),
    fs = require('fs'),
    path = require('path'),
    dom = require('xmldom').DOMParser,
    select = require('xpath.js');
    //x509 = require('node-x509-master');

//should be extracted manually from sig.crt.pem
//may cause error due to spacing issue
var PUBLIC_KEY = "MIIDuDCCAqCgAwIBAgIGA7J+eqryMA0GCSqGSIb3DQEBBQUAMIGNMQswCQYDVQQG"+"\n"+
 "EwJJTjELMAkGA1UECBMCS0ExEjAQBgNVBAcTCUJhbmdhbG9yZTETMBEGA1UEChMK"+"\n"+
 "UHVibGljIEFVQTEZMBcGA1UECxMQU3RhZ2luZyBTZXJ2aWNlczEtMCsGA1UEAxMk"+"\n"+
 "Um9vdCBQdWJsaWMgQVVBIGZvciBTdGFnaW5nIFNlcnZpY2VzMB4XDTE2MDUyNDE0"+"\n"+
 "NDAzMVoXDTIwMDUyNDE0NDAzMVowgYgxCzAJBgNVBAYTAklOMQswCQYDVQQIEwJL"+"\n"+
 "QTESMBAGA1UEBxMJQmFuZ2Fsb3JlMRMwEQYDVQQKEwpQdWJsaWMgQVVBMRkwFwYD"+"\n"+
 "VQQLExBTdGFnaW5nIFNlcnZpY2VzMSgwJgYDVQQDEx9QdWJsaWMgQVVBIGZvciBT"+"\n"+
 "dGFnaW5nIFNlcnZpY2VzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA"+"\n"+
 "o4XxOsjK58Ud+tQd06Mk8Rd0qoyjA/3u+y0YVYEF6RgT8Ge1uVdTkIcVYaHyXuuH"+"\n"+
 "UPLLqGW1hPfVtn81UVIMGyrw5+t1c30wpGv3UJ6GCFu0sPGgG5NwkVbIUt2xgT/O"+"\n"+
 "r/kGzHjUJJy4Y6URSkZiDLDQQWRXvui5ZwwsYRJ8LhT0pSUwan1raG5Vl01GmlWV"+"\n"+
 "qsrCmnObuoYkN85iwG4/ERGshkgFCPak8B/jH3GPZSi1+FJLmCqMI1xxmTvf0kZb"+"\n"+
 "7ejm2IZFTo6ecYWJ1vylkzUI553RxVbnHCNZvFe3AyaKMyFlknFR0Fkl5+9Lpxz+"+"\n"+
 "VOajbCjicg7jIYCw76/xgQIDAQABoyEwHzAdBgNVHQ4EFgQUJHLir1/Tel8v/6Ou"+"\n"+
 "IXpLS0JH8jIwDQYJKoZIhvcNAQEFBQADggEBAFE15qMGIlp8+M306FbhDEvo1vzx"+"\n"+
 "N2Pfvg/f92NXH59d2XZ/wuHxugL8qfcM5xkqsDeIRVxRdISpwiIWlqTitn6lenF8"+"\n"+
 "5bvPQ09T/b09dVz/LxwU2Cm6+6H5/HZSoLtCKBOuRzAKQdxczpyfaqv9caFC+Leg"+"\n"+
 "PQIm2HCwOM0A4KzhYcFhumGeyCbyVZsSQcJE7bYc/IHkR2erup7h5BACOZ/a+hHL"+"\n"+
 "PQok/uGvtEsR3roydNcNlR8Ja6Wc4eUf7kisTuZTxwRJI9DPVimbs0VAqhnsnVWA"+"\n"+
"K3X4+6sFUq5WfHS4wTRhrR93JvEV5LlQ6UCXYOQMvTii8l07qxkDiysVsLQ=";

var PUBLIC_KEY_VERIFY = "MIIDuDCCAqCgAwIBAgIGA7J+eqryMA0GCSqGSIb3DQEBBQUAMIGNMQswCQYDVQQG"+"\n"+
"EwJJTjELMAkGA1UECBMCS0ExEjAQBgNVBAcTCUJhbmdhbG9yZTETMBEGA1UEChMK"+"\n"+
"UHVibGljIEFVQTEZMBcGA1UECxMQU3RhZ2luZyBTZXJ2aWNlczEtMCsGA1UEAxMk"+"\n"+
"Um9vdCBQdWJsaWMgQVVBIGZvciBTdGFnaW5nIFNlcnZpY2VzMB4XDTE2MDUyNDE0"+"\n"+
"NDAzMVoXDTIwMDUyNDE0NDAzMVowgYgxCzAJBgNVBAYTAklOMQswCQYDVQQIEwJL"+"\n"+
"QTESMBAGA1UEBxMJQmFuZ2Fsb3JlMRMwEQYDVQQKEwpQdWJsaWMgQVVBMRkwFwYD"+"\n"+
"VQQLExBTdGFnaW5nIFNlcnZpY2VzMSgwJgYDVQQDEx9QdWJsaWMgQVVBIGZvciBT"+"\n"+
"dGFnaW5nIFNlcnZpY2VzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA"+"\n"+
"o4XxOsjK58Ud+tQd06Mk8Rd0qoyjA/3u+y0YVYEF6RgT8Ge1uVdTkIcVYaHyXuuH"+"\n"+
"UPLLqGW1hPfVtn81UVIMGyrw5+t1c30wpGv3UJ6GCFu0sPGgG5NwkVbIUt2xgT/O"+"\n"+
"r/kGzHjUJJy4Y6URSkZiDLDQQWRXvui5ZwwsYRJ8LhT0pSUwan1raG5Vl01GmlWV"+"\n"+
"qsrCmnObuoYkN85iwG4/ERGshkgFCPak8B/jH3GPZSi1+FJLmCqMI1xxmTvf0kZb"+"\n"+
"7ejm2IZFTo6ecYWJ1vylkzUI553RxVbnHCNZvFe3AyaKMyFlknFR0Fkl5+9Lpxz+"+"\n"+
"VOajbCjicg7jIYCw76/xgQIDAQABoyEwHzAdBgNVHQ4EFgQUJHLir1/Tel8v/6Ou"+"\n"+
"IXpLS0JH8jIwDQYJKoZIhvcNAQEFBQADggEBAFE15qMGIlp8+M306FbhDEvo1vzx"+"\n"+
"N2Pfvg/f92NXH59d2XZ/wuHxugL8qfcM5xkqsDeIRVxRdISpwiIWlqTitn6lenF8"+"\n"+
"5bvPQ09T/b09dVz/LxwU2Cm6+6H5/HZSoLtCKBOuRzAKQdxczpyfaqv9caFC+Leg"+"\n"+
"PQIm2HCwOM0A4KzhYcFhumGeyCbyVZsSQcJE7bYc/IHkR2erup7h5BACOZ/a+hHL"+"\n"+
"PQok/uGvtEsR3roydNcNlR8Ja6Wc4eUf7kisTuZTxwRJI9DPVimbs0VAqhnsnVWA"+"\n"+
"K3X4+6sFUq5WfHS4wTRhrR93JvEV5LlQ6UCXYOQMvTii8l07qxkDiysVsLQ=";
//should be manually extracted from sig.crt.pem 'friendlyName'
var subjectName = "CN=Public AUA for Staging Services,OU=Staging Services,O=Public AUA,L=Bangalore,ST=KA,C=IN";
var subjectNameVerify = "CN=Public AUA for Staging Services,OU=Staging Services,O=Public AUA,L=Bangalore,ST=KA,C=IN";
//var subjectName = "public";
//custom key info Provider
function AadhaarKeyInfo(){
    this.getKeyInfo = function(key,prefix){
        var x509XML = builder.create('X509Data',{version: '1.0', encoding: 'UTF-8', standalone: true},
            {pubID: null, sysID: null},
            {allowSurrogateChars: false, skipNullAttributes: false,
                headless: true, ignoreDecorators: false,
                separateArrayItems: false, noDoubleEncoding: false,
                stringify: {}})
            .ele('X509Certificate',null,PUBLIC_KEY_VERIFY)
            .up()
            .ele('X509SubjectName',null,subjectName)
            .end();
        return x509XML;
    };
    this.getKey = function(keyInfo){
    	return PUBLIC_KEY;
    };
}

function AadhaarVerifyKeyInfo(){
    this.getKeyInfo = function(key,prefix){
        var x509XML = builder.create('X509Data',{version: '1.0', encoding: 'UTF-8', standalone: true},
            {pubID: null, sysID: null},
            {allowSurrogateChars: false, skipNullAttributes: false,
                headless: true, ignoreDecorators: false,
                separateArrayItems: false, noDoubleEncoding: false,
                stringify: {}})
            .ele('X509Certificate',null,PUBLIC_KEY)
            .up()
            .ele('X509SubjectName',null,subjectNameVerify)
            .end();
        return x509XML;
    };
    this.getKey = function(keyInfo){
    	return PUBLIC_KEY_VERIFY;
    };
}

//signs and returns final xml to be sent
module.exports.signXML = function(xml){

    var sig = new SignedXml();
    console.log(__dirname);
	var file = path.join(__dirname, '/..', "templates/sig.key.pem");
	console.log(file);
    sig.signingKey = fs.readFileSync(file);
    sig.addReference("//*[local-name(.)='Auth']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"], "http://www.w3.org/2000/09/xmldsig#sha1", "", "", "", true);
    sig.keyInfoProvider = new AadhaarKeyInfo();
    sig.computeSignature(xml);
    /*sig.loadSignature(sig.getSignatureXml());
    var res = sig.checkSignature(sig.getSignedXml());
    console.log(res);
    if (!res) console.log(sig.validationErrors);*/
    return sig.getSignedXml();
};
module.exports.parseToDom = function(xml,callback){
	var doc = new dom().parseFromString(xml.toString());
	callback(doc);
};
module.exports.verifyXmlString = function(xml){
	console.log(xml);
	//xml = xml.toString();
	/*var domvar = this.parseToDom(xml,function(doc){
		console.log(doc);
	});*/
	//var doc = new dom().parseFromString(domvar);
	var signature = select(xml, "/*/*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0]
    var sig = new SignedXml();
    sig.keyInfoProvider = new AadhaarVerifyKeyInfo();
    sig.loadSignature(signature);
    var res = sig.checkSignature(xml);
    if (!res) console.log(sig.validationErrors);
};