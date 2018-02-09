var utils = require("../utils/util"),
    config = require("../Config/config"),
    UniversityUsers = require("../Dao/universityDao").universityUsers;
var options = {
    host:config.issuerIp,
    port:config.issuerPort,
    path:"/login/validate",
    method:'POST',
    headers: {
      'Content-Type': 'application/json'
    }
};
/*
----------------------------check admin login ---------------------------------

*/
/**
* @author: Vivek (vivek@xanbell.com)

* Check Admin Login

* method for checking the admin login

* @param: token

* @return: ??

* */
var checkAdminLogin = function (token,action) {
    var pass = utils.getHash(token.toString()+"gHgtYjNv52^512");
    options.host = config.adminIp;
    options.port = config.adminPort;
    options.path = "/admin/login/validate";
    utils.httpRequest({token:token,password:pass},options,function(arg){
        action(arg);
    });
};

/*
----------------------------------------------Disable University User-----------------------------------
*/
/**
* @author: Vivek (vivek@xanbell.com)

* Update University Users

* method for updating the University Users

* @param: University User Information

* @return: 1 if updated successfully else -1

* */

exports.updateUniversityUsers = function (request,response) {
    checkAdminLogin(request.body.token,function (login) {
        if(login.token&&request.body.universityId){
            UniversityUsers.update({universityId:request.body.universityId},{$set:{enable:false}},function (argument) {
                console.log("users updated");
                response.json(utils.success);
            });
        }else {
            response.json(utils.unauth);
        }
    });
};

/*
---------------------------------------------- Create University User -----------------------------------
*/

/**
* @author: Vivek (vivek@xanbell.com)

* Add University Users

* method for adding University Users

* @param: University User Information

* @return: 1 if added successfully else -1

* */

exports.createUniversityUsers = function (request,response) {
    checkAdminLogin(request.body.token||" ",function (login) {
        if(!login){
            response.json(utils.unauth);
            console.log("createUniversityUsers : no login");
            return;
        }
        if(login.token){
            var user = new UniversityUsers();
            var data = request.body;
            var lkey = utils.getLkey();
            user.emailId = utils.encrypt(data.emailId,lkey);
            user.save(function (err) {
                if(err){
                    console.log(err);
                    console.log("unable to create university user");
                }else {
                    var sk = user._id+utils.getHash(user._id);
                    user.name = data.name?utils.encrypt(data.name,sk):"";
                    user.contactNumber = data.contactNumber?utils.encrypt(data.contactNumber,sk):"";
                    user.checkerId = data.checkerId?utils.encrypt(data.checkerId,sk):"";
                    user.password = (data.password) ? utils.encrypt(data.password||"password",utils.getHash(data.password||"password")) : "";
                    user.universityId = data.universityId?data.universityId:"";
                    user.role = data.role||"1";
                    user.enable = true;
                    user.save(function (err) {
                        if(err){
                            console.log("error encrypting");
                        }else {
                            console.log("success");
                        }
                    });
                    response.json(utils.success);
                }
            });
        }else {
            console.log("unauth");
            response.json(utils.unauth);
        }
    });
};

/*
---------------------------------------------- Get Checkers -----------------------------------
*/
/**
* @author: Vivek (vivek@xanbell.com)

* Fetch University Users

* method for getting the University Users

* @param: token for validation

* @return: get all university users

* */

exports.getUniversityUsers = function (request,response) {
    checkAdminLogin(request.body.token||" ",function (login) {
        if(!login){
            response.json(utils.unauth);
            console.log("getUniversityUsers : no login");
            return;
        }
        if(login.token){
            UniversityUsers.find({
                role: request.body.role||" ",
                enable:true
            })
                .exec(function (err,docs) {
                    if(err){
                        console.log("error getting users");
                        response.json([]);
                        return;
                    }else {
                        console.log("got docs");
                        var lkey = utils.getLkey();
                        for(var i = 0;i<docs.length;i++){
                            var sk = docs[i]._id+utils.getHash(docs[i]._id);
                            docs[i].name = docs[i].name?utils.decrypt(docs[i].name,sk):"";
                            docs[i].contactNumber = docs[i].contactNumber?utils.decrypt(docs[i].contactNumber,sk):"";
                            docs[i].checkerId = docs[i].checkerId?utils.decrypt(docs[i].checkerId,sk):"";
                            docs[i].password = "";
                            docs[i].universityId = docs[i].universityId?docs[i].universityId:"";
                            docs[i].role = docs[i].role||"1";
                            docs[i].emailId = docs[i].emailId?utils.decrypt(docs[i].emailId,lkey):"";
                        }
                        response.json(docs);
                    }
                });
        }else {
            console.log("unauth");
            response.json(utils.unauth);
        }
    });
};

/*
---------------------------------------------- disable University User -----------------------------------
*/
/**
* @author: Vivek (vivek@xanbell.com)

* Disable University Users

* method for Disabling the University Users

* @param: University User Information

* @return: 1 if disabled successfully else -1

* */

exports.disableUniversityUsers = function (request,response) {
    checkAdminLogin(request.body.token||" ",function (login) {
        if(!login){
            response.json(utils.unauth);
            console.log("disableUniversityUsers : no login");
            return;
        }
        if(login.token){
            UniversityUsers.findOne({
                _id: request.body.id||" "
            })
                .exec(function (err,docs) {
                    if(err){
                        console.log("error getting users");
                        response.json(utils.failure);
                        return;
                    }else {
                        docs.enable = false;
                        docs.save(function(err){
                            if(!err){
                                response.json(utils.success);
                                console.log("disableUniversityUsers : success");
                            }else{
                                console.log("disableUniversityUsers  : failure");
                            }
                        });                       
                    }
                });
        }else {
            console.log("unauth");
            response.json(utils.unauth);
        }
    });
};
