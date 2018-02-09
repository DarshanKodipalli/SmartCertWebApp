module.exports = {
		databaseUrls:"mongodb://127.0.0.1:27017/univ"||process.env.DB,
		CollectionNames:{
			viewRequest:"viewRequests",
			certificates:"certificates"
		},
		port:process.env.PORT || "3002",
		issuerIp: "58.68.95.151",
	    issuerPort: 3001,
	    adminIp:"56.68.95.151",
	    adminPort:3010,
	    studentIp:"56.68.95.151",
	    studentPort:3004,
	    blockChainIp:"localhost",
	    blockChainPort:3008
};