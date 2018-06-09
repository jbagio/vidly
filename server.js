require('dotenv').load();
const winston = require('winston');
const express = require('express');

const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/database')();
require('./startup/config')();
require('./startup/validation')();

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Server listening on port ${port}...`));
