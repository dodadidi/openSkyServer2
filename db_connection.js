const mongoose = require('mongoose');
const consts = require('./constants' );
const { DB_HOST, DB_USER, DB_PASS } = consts;
const url = DB_HOST;
const options = {
 useNewUrlParser: true, // For deprecation warnings
 useCreateIndex: true, // For deprecation warnings
 useUnifiedTopology: true, // For deprecation warnings
 user: DB_USER,
 pass: DB_PASS
};
return mongoose //reference to mongoose
 .connect(url, options)

