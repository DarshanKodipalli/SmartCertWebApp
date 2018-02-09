module.exports = {
		databaseUrls:"mongodb://127.0.0.1:27017/StudentNew",
		CollectionNames:{
			student:"students",
			studentLogin:"studentLogins",
			viewRequest:"viewRequests",
			university:"universities",
			institution:"institutions",
			certificates:"certificates",
			batches:"batches"
		},
		port:process.env.PORT || "3004",
            issuerIp: "58.68.74.119",
	    issuerPort: 3001,
	    adminIp:"56.68.95.151",
	    adminPort:3010,
	    studentIp:"56.68.95.151",
	    studentPort:3004,
	    blockChainIp:"localhost",
	    blockChainPort:3008
};
