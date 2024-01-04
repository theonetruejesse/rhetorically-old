import { STORAGE_BUCKET } from "./constants";
import admin = require("firebase-admin");
// need to move it out of src, rn not cuz its screwing up tsc compilation
import serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  storageBucket: STORAGE_BUCKET,
  // @ts-ignore, firebase lib typing error
  credential: admin.credential.cert(serviceAccount),
});

import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
export const helloWorld = onRequest((req, res) => {
  logger.log("Hello logger!");
  res.send("Hello from Firebase!");
});

import proxy = require("./endpoints/proxy");
exports.redirectToLandingPage = proxy.redirectToLandingPage;
exports.proxyTokenUrl = proxy.proxyTokenUrl;
exports.proxyAuthUrl = proxy.proxyAuthUrl;

import drive = require("./endpoints/drive");
exports.listDocs = drive.listDocs;

import * as docs from "./endpoints/docs";
exports.getIndexedText = docs.getIndexedText;
exports.saveDocVersion = docs.saveDocVersion;
exports.annotateDoc = docs.annotateDoc;
exports.highlightText = docs.highlightText;
exports.addComments = docs.addComments;

import oauth = require("./endpoints/oauth");
exports.googleSignIn = oauth.googleSignIn;
exports.oauth2callback = oauth.oauth2callback;
