# gcp-dicomweb-proxy

## Deploy

Deploy command:

```bash
gcloud functions deploy proxy --runtime nodejs20 --trigger-http --allow-unauthenticated
```

After deploying, run the following if you want it to be accessible to all users (you will need `cloudfunctions.functions.setIamPolicy` IAM permission to perform this operation):

```bash
gcloud functions add-iam-policy-binding prostate_seg_proxy --region=us-central1 --member=allUsers --role=roles/cloudfunctions.invoker
```



Conversation that helped fix the code to make it deploy: https://www.perplexity.ai/search/i-am-trying-to-deploy-a-google-BjRoJupjQ2eup440PQOEAQ

Not so helpful conversation with Gemini, which however includes instructions on how to configure AppEngine SA to permit access to GHC DICOM store: https://g.co/gemini/share/46ab5254e2c8

## Permissions

Service account used by the function is listed under details of the function in https://console.cloud.google.com/functions.

## Testing

To confirm proxy is working (once deployment is successful): get URL under the "Trigger" tab in the function details (at the URL above) and test with curl:

```bash
curl <TRIGGER_URL>/studies
```
