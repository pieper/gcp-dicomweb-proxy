/*
 * Responds to any HTTP request.
 * https://joshuatz.com/posts/2019/google-cloud-functions-http-proxy-relay-with-http-proxy-middleware/
 */
const {google} = require('googleapis');
const express = require('express');
const cors = require('cors');
const proxyMiddleware = require('http-proxy-middleware');

const dicomURL = process.env.DICOMURL || 'https://healthcare.googleapis.com/v1/projects/idc-external-031/locations/us-central1/datasets/projectweek40/dicomStores/projectweek40-store/dicomWeb/';

const app = express();
app.use(cors());

let token = null;

function getProxy() {
  return proxyMiddleware({
    target: dicomURL,
    changeOrigin: true,
    followRedirects: true,
    secure: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('Authorization', `Bearer ${token}`);
    },
  });
}

function getToken() {
  return google.auth.getAccessToken()
    .then(accessToken => {
      console.log("got token", accessToken);
      token = accessToken;
      // new token every 30 minutes
      setTimeout(getToken, 1000 * 60 * 30);
      return token;
    })
    .catch(error => {
      token = null;
      console.error(`failed to get token:`, error);
      console.error(`will try again in a second.`);
      setTimeout(getToken, 1000);
      throw error;
    });
}

// Export the function that Cloud Functions will call
exports.proxy = async (req, res) => {
  try {
    // Get token if we don't have one
    if (!token) {
      await getToken();
    }
    
    // Use the proxy middleware
    app.all('*', getProxy());
    
    // Handle the request
    app(req, res);
  } catch (error) {
    console.error('Error in proxy function:', error);
    res.status(500).send('Internal Server Error');
  }
};
