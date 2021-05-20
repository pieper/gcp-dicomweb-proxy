/*
 * Responds to any HTTP request.
 * https://joshuatz.com/posts/2019/google-cloud-functions-http-proxy-relay-with-http-proxy-middleware/
 */
const {google} =require('googleapis');

const express = require('express');
const cors = require('cors');
const proxyMiddleware = require('http-proxy-middleware');

const port = process.env.PORT || 8080;

//const dicomURL = process.env.DICOMURL || 'https://healthcare.googleapis.com/v1beta1/projects/project-7519307760985532298/locations/us-central1/datasets/SampleData/dicomStores/dicomstore1/dicomWeb/';
const dicomURL = process.env.DICOMURL || 'https://healthcare.googleapis.com/v1beta1/projects/idc-external-006/locations/us-central1/datasets/hackathon/dicomStores/2021-ecdp/dicomWeb/';

let app;
let token = null;

function runApp() {
  app = express();
  app.use(cors());
  app.all('*', getProxy());

  app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });
}

function getToken() {
  google.auth.getAccessToken().then(accessToken => {
    console.log("got token", accessToken);
    token = accessToken;
    runApp();
    // new token every 30 minutes
    setTimeout(getToken, 1000 * 60 * 30);
  }).catch(error => {
    token = null;
    console.error(`failed to get token: ${stderr}`);
    console.error(`will try again in a second.`);
    setTimeout(getToken, 1000);
  });
}
getToken();

function getProxy() {
  const dicomProxy = proxyMiddleware({
    target: dicomURL,
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Authorization', `Bearer ${token}`);
    },
  });
  return dicomProxy;
}

