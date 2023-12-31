import * as logger from "firebase-functions/logger";

import { onRequest } from "firebase-functions/v2/https";

import admin = require("firebase-admin");
admin.initializeApp();

export const helloWorld = onRequest((req, res) => {
  logger.log("Hello logger!");
  res.send("Hello from Firebase!");
});

import proxy = require("./endpoints/proxy");
exports.proxyTokenUrl = proxy.proxyTokenUrl;
exports.proxyAuthUrl = proxy.proxyAuthUrl;

import drive = require("./endpoints/drive");
exports.listDocs = drive.listDocs;
