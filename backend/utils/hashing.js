const { hash, compare } = require("bcryptjs");

const doHash = async (value, saltvalue) => {
  return await hash(value, saltvalue);
};

const doHashValidation = async (value, hashedValue) => {
  return await compare(value, hashedValue);
};

module.exports = { doHash, doHashValidation };
