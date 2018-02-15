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
            issuerIp: "localhost",
	    issuerPort: 3001,
	    adminIp:"localhost",
	    adminPort:3010,
	    studentIp:"localhost",
	    studentPort:3004,
	    blockChainIp:"localhost",
	    blockChainPort:3008
};
