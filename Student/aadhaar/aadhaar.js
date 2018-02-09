var constant = require("../constants/constants"),
XmlBuilders = require('../util/XmlBuilders'),
sig = require('../util/DigitalSignature'),
util = require('../util/util'),
http = require('http'),
dao = require("../dao/dao"),
Aadhar = dao.aadharTable;

var validateaadharInput = function (req){
	var pi = (!constant.aadharConfig.format.pi.include)||
	((constant.aadharConfig.format.pi.include===true) &&
		((constant.aadharConfig.format.pi.name===true && req.name)||
			(constant.aadharConfig.format.pi.phone===true && req.phoneNumber)||
			(constant.aadharCOnfig.format.pi.email===true && req.emailId)||
			(constant.aadharConfig.format.pi.dob === true && req.dateOfBirth)
		)
	);
	var pfa = (!constant.aadharConfig.format.pfa.include)||((constant.aadharConfig.format.pfa.include===true) && (req.address));
	return (pi||pfa);
};

var aadharVerifyMatch = function (bin){
	var result = {};
	var flag = 0;
	var res = constant.aadharConfig.response;
	if(bin.charAt(res.piName)==='1'){
		if(bin.charAt(res.piNameMatch)==='1'){
			result.name = true;
		}
		else{
			flag++;
			result.name = false;
		}
	}
	if(bin.charAt(res.piEmail)==='1'){
		if(bin.charAt(res.piemailMatch)==='1'){
			result.emailId = true;
		}
		else{
			flag++;
			result.emailId = false;
		}
	}
	if(bin.charAt(res.piPhone)==='1'){
		if(bin.charAt(res.piPhoneMatch)==='1'){
			result.phoneNumber = true;
		}
		else{
			flag++;
			result.phoneNumber = false;
		}
	}
	if(bin.charAt(res.pidob)==='1'){
		if(bin.charAt(res.pidobMatch)==='1'){
			result.dateOfBirth = true;
		}
		else{
			flag++;
			result.dateOfBirth = false;
		}
	}
	if(bin.charAt(res.pfa)==='1'){
		if(bin.charAt(res.pfaMatch)==='1'){
			result.address = true;
		}
		else{
			flag++;
			result.address = false;
		}
	}
	if(flag>0){
		result.auth = false;
		result.errorCode = 3;//one or more param did not match
	}
	else{
		result.auth = true;
		result.errorCode = 4;//success
	}
	return result;
};
var sendAuthenticationRequest = function (req,action){
	if(!constant.aadharConfig.authenticate){
		action({errorCode:0});//no auth required
	}
    if(!req.aadhaarId)
    {
        console.log("Invalid parameters");
        action({errorCode:2});//aadhar number missing
    }
    else if(!validateaadharInput(req)){
    	console.log("Invalid Parameters");
    	action({errorCode:2}); // authentication fields missing
    }
    else{
    	var xml = XmlBuilders.buildXmlInput(req);
        var finalRequestXml = sig.signXML(xml);
        var options = {
                "host": constant.public_config_attrs.host,
                "path": util.developmentUrlPath(req.aadhaarId),
                "method": 'POST',
                "headers": {
                    "Content-Type":"application/xml"
                }
            };
       var request = http.request(options,function(res){
        	 console.log(res.statusCode);
        	 res.setEncoding('utf8');
        	 res.on( "data", function( data ) {
        		 console.log(data);
                var beg = data.search("{");
                var end = data.search("}");
               	var info = data.substr(beg+1,end-1);
               	var encodedUsageData = info.split(",");
                var enc = encodedUsageData[2];
               	var hex = parseInt(enc, 16).toString(2);
               	var result = aadharVerifyMatch(hex);
               /*	var sigBegin = data.toString('utf8').search("<Signature>");
               	var sigEnd = data.toString('utf8').search("</Signature");
               	var signature = data.substr(sigBegin,sigEnd);
               	console.log(signature);
               	sig.verifyXmlString(signature);*/
               	console.log(result);
               	action(result);
            });
       });
        request.on('error',function(err){
            console.log(err.message);
        });
        console.log('about to send');
        console.log(finalRequestXml);
        request.write(finalRequestXml);
        request.end();
       
    }
};

exports.studentRegistrationAadhar = function(request,response){
	if(constant.aadharConfig.authenticate===true){
		sendAuthenticationRequest(request.body.student,function(result){
					console.log(result);
					response.json({aadharResponse:result});
		});
	}
	else{
			response.json({aadharResponse:null});
	}
};

exports.insertaadhar = function (student,callback){
	if(util.aadhaarFlag()){
		callback({status:1});
		return;
	}
	if(student.aadhaarId){
		var aadhar = new Aadhar();
		var lkey = util.getLkey();
		aadhar.aadhaarNumber = util.encrypt(student.aadhaarId,lkey);
		aadhar.save(function(err){
			if(err){
				console.log("Could not save aadhar\n");
				console.log(err);
				callback(util.failure);
			}
			else{
				Aadhar.findOne({aadhaarNumber:aadhar.aadhaarNumber})
				.exec(function(err,doc){
					if(err){
						callback(util.failure);
					}
					else{
						callback({id:doc._id,status:1});
					}
				});
			}
		});
	}
	else{
		callback({id:null,status:1});
	}
};