module.exports = {
  databaseUrls: "mongodb://127.0.0.1:27017/admin",
  CollectionNames: {
    university: "university",
    student: "student",
    institution: "institution"
  },
  port: process.env.PORT || "8545",
    internalIp:"localhost",
    issuerIp: "localhost",
    issuerPort: 3001,
    adminIp:"localhost",
    adminPort:3010,
    studentIp:"localhost",
    studentPort:3004,
    blockChainIp:"localhost",
    blockChainPort:3008
};

