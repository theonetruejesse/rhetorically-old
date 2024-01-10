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
// testing
export const helloWorld = onRequest((_, res) => {
  logger.log("Hello logger!");
  res.send("Hello from Firebase!");
});

import proxy = require("./endpoints/proxy");
exports.redirectToLandingPage = proxy.redirectToLandingPage; // website
exports.proxyTokenUrl = proxy.proxyTokenUrl; // gpt oauth perms
exports.proxyAuthUrl = proxy.proxyAuthUrl; // gpt oauth perms

import drive = require("./endpoints/drive");
exports.listDocs = drive.listDocs; // gpt actions endpoint
exports.createCopy = drive.createCopy; // testing

import * as docs from "./endpoints/docs";
exports.getIndexedText = docs.getIndexedText; // gpt actions endpoint
exports.saveDocVersion = docs.saveDocVersion; // gpt actions endpoint
exports.addComments = docs.addComments; // gpt actions endpoint
exports.highlightText = docs.highlightText; // testing

import oauth = require("./endpoints/oauth");
exports.googleSignIn = oauth.googleSignIn; // testing
exports.oauth2callback = oauth.oauth2callback; // testing
