/*
 * Responds to any HTTP request.
 * https://joshuatz.com/posts/2019/google-cloud-functions-http-proxy-relay-with-http-proxy-middleware/
 */
const childProcess = require('child_process');

const express = require('express');
const proxyMiddleware = require('http-proxy-middleware');

const port = process.env.PORT || 80;

const dicomURL = process.env.DICOMURL || 'https://healthcare.googleapis.com/v1beta1/projects/project-7519307760985532298/locations/us-central1/datasets/SampleData/dicomStores/dicomstore1/dicomWeb/';

let token = null;

function getToken() {
  childProcess.exec("gcloud auth print-access-token", (error,stdout,stderr) => {
    if (error) {
      token = null;
      console.error(`failed to get token: ${stderr}`);
      console.error(`will try again in a second.`);
      setTimeout(getToken, 1000);
    } else {
      token = stdout.trim();
      // new token every 30 minutes
      setTimeout(getToken, 1000 * 60 * 30);
    }
  });
}
getToken();


const app = express();
app.all('*', getProxy());

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

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
