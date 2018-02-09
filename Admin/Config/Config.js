module.exports = {
  databaseUrls: "mongodb://127.0.0.1:27017/admin",
  CollectionNames: {
    university: "university",
    student: "student",
    institution: "institution"
  },
  port: process.env.PORT || "8545",
    internalIp:"192.168.0.36",
    issuerIp: "58.68.95.151",
    issuerPort: 3001,
    adminIp:"56.68.95.151",
    adminPort:3010,
    studentIp:"56.68.95.151",
    studentPort:3004,
    blockChainIp:"localhost",
    blockChainPort:3008
};

