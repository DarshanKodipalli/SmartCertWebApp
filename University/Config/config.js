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
		issuerIp: "58.68.95.151",
	    issuerPort: 3001,
	    adminIp:"56.68.95.151",
	    adminPort:3010,
	    studentIp:"56.68.95.151",
	    studentPort:3004,
	    blockChainIp:"localhost",
	    blockChainPort:3008,
	    verifierIp:"58.68.95.151",
	    verifierProofIp:"56.68.95.151",
	    verifierPort:3002

};
