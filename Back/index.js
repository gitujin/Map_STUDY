const express = require("./config/express");
const { logger } = require("./config/winston"); // log

const port = 3000;
express().listen(port); // express 프레임워크를 실행시키겠다.

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
