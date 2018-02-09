
var builder = require('xmlbuilder'),
    encryptionUtils = require('./EncryptionUtils'),
    constants = require('../constants/constants.js');

module.exports.buildXmlInput = function buildXmlInput(req)
{
    var xmlBuilder = builder.create('Auth',{version: '1.0', encoding: 'UTF-8', standalone: false});

    //1.6
    var authAttr = {
    	"xmlns":"http://www.uidai.gov.in/authentication/uid-auth-request/1.0",
    	"ac":constants.public_config_attrs.ac,
    	"lk":constants.public_config_attrs.lk,
    	"sa":constants.public_config_attrs.sa,
    	"tid":constants.public_config_attrs.tid,
    	"txn":constants.public_config_attrs.txn,
        "uid":req.aadhaarId,        
        "ver":constants.public_config_attrs.ver
        };
    console.log(constants.public_config_attrs.txn);
    xmlBuilder.attribute(authAttr);

    var pid = buildPidXML(req);
    console.log(pid);
    var requestData = encryptionUtils.encryptPid(pid);
    console.log(requestData.encryptedPid);

    //1.6
   var metaAttr = {
        "fdc":"NA",
        "idc":"NA",
        "lot":"P",
        "lov":"560061",
        "pip":"NA", 
        "udc":"UIDAI:SampleCLient"
    };

    var xml = xmlBuilder
    	.ele("Uses",constants.basic_uses_attrs).up()
    	.ele("Meta",metaAttr,null).up()
    	.ele("Skey",{ci:constants.public_config_attrs.ci},requestData.encryptedSkey).up()
        .ele("Data",{type:"X"},requestData.encryptedPid).up()
        .ele("Hmac",null,requestData.hmac).up()
        .end();
    console.log(xml);
   /* xml = xml.replace("/><Meta","></Uses><Meta");
    xml = xml.replace("/><Skey","></Meta><Skey");
    console.log("After");
    console.log(xml);*/
    return xml;
};

function buildPidXML(req){
    var pidXmlBuilder = builder.create('Pid',{version: '1.0', encoding: 'UTF-8'},
    {pubID: null, sysID: null},
    {allowSurrogateChars: false, skipNullAttributes: false,
        headless: true, ignoreDecorators: false,
        separateArrayItems: false, noDoubleEncoding: false,
        stringify: {}});
    var timeStamp = formatTimeStamp();
    pidXmlBuilder.attribute({xmlns:"http://www.uidai.gov.in/authentication/uid-auth-request/1.0",ts:timeStamp, ver :"1.0"});

    	var pi,pfa;
    	if(constants.aadharConfig.format.pi.include){
    		pi = {ms:constants.aadharConfig.format.pi.ms,mv:constants.aadharConfig.format.pi.mv};
    		if(constants.aadharConfig.format.pi.name){
    			pi.name=req.name;
    		}
    		if(constants.aadharConfig.format.pi.dob){
                console.log("Date of Birth");
    			console.log(req.dateOfBirth);
                var d = new Date(req.dateOfBirth);
                console.log("Date")
                console.log(d);
    			var year = d.getFullYear(),
    	        month = d.getMonth(),
    	        day = d.getDate();
    			//formatting to YYYY-MM-DD
    			var formattedDate = year+"-"+(month+1<10?"0":"")+(month+1)+"-"+(day<10?"0":"")+day;
    			console.log(formattedDate);
    			pi.dob=formattedDate;
    		}
    		if(constants.aadharConfig.format.pi.phone){
    			pi.phone=req.phoneNumber;
    		}
    		if(constants.aadharConfig.format.pi.email){
    			pi.email=req.emailId;
    		}
    	}
    	if(constants.aadharConfig.format.pfa.include){
    		pfa = {ms:constants.aadharConfig.format.pfa.ms,mv:constants.aadharConfig.format.pfa.mv};
    		if(constants.aadharConfig.format.pfa.av){
    			pfa.av =req.address;
    		}
    	}
    	
    	if(constants.aadharConfig.format.pfa.include&&constants.aadharConfig.format.pi.include){
    		pidXmlBuilder.element("Demo").element("Pi",pi).up().element("Pfa",pfa);
    	}
    	else if(constants.aadharConfig.format.pfa.include){
    		pidXmlBuilder.element("Demo").element("Pfa",pfa);
    	}
    	else{
    		pidXmlBuilder.element("Demo").element("Pi",pi);
    	}
    return pidXmlBuilder.end();
}

//timestamp should be in the format YYYY-MM-DDThh:mm:ss (ISO 8601) standard
function formatTimeStamp(){
    var date = new Date();
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
    console.log(formattedStamp);

    return formattedStamp;
}