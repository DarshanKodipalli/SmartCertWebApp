module.exports = {
		databaseUrls:"mongodb://127.0.0.1:27017/univ",
		CollectionNames:{
			university:"university",
			transction:"transaction",
			student:"student",
			certificate:"certificate",
			institution:"institution"
		},
		port:process.env.PORT || "3001",
		internalIp:"localhost",
		issuerIp: "localhost",
	    issuerPort: 3001,
	    adminIp:"localhost",
	    adminPort:3010,
	    studentIp:"localhost",
	    studentPort:3004,
	    blockChainIp:"localhost",
	    blockChainPort:3008,
	    verifierIp:"localhost",
	    verifierProofIp:"localhost",
	    verifierPort:3002

};
