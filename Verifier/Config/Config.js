module.exports = {
		databaseUrls:"mongodb://127.0.0.1:27017/univ"||process.env.DB,
		CollectionNames:{
			viewRequest:"viewRequests",
			certificates:"certificates"
		},
		port:process.env.PORT || "3002",
		issuerIp: "localhost",
	    issuerPort: 3001,
	    adminIp:"localhost",
	    adminPort:3010,
	    studentIp:"localhost",
	    studentPort:3004,
	    blockChainIp:"localhost",
	    blockChainPort:3008
};