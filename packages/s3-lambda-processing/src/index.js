'use strict';
import AWS from 'aws-sdk';
import { simpleParser } from 'mailparser';
import axios from 'axios';

const s3 = new AWS.S3();
const ssm = new AWS.SSM();
const BUCKET = process.env.BUCKET;
const URL = process.env.URL;
const STAGE = process.env.STAGE;

let cacheInstance;

async function buildAxios() {
  if (cacheInstance) {
    return cacheInstance;
  }

  const apiKey = await ssm
    .getParameter({
      Name: `/linen-dev/${STAGE}/INTERNAL_API_KEY`,
      WithDecryption: true,
    })
    .promise();

  cacheInstance = axios.create({
    headers: { 'x-api-internal': apiKey.Parameter?.Value },
  });

  return cacheInstance;
}

module.exports.handler = async function (event, context, callback) {
  console.log('Process email');
  console.log(event.Records[0]);
  const s3Object = event.Records[0].s3.object;
  console.log('S3 Obj.:\n', JSON.stringify(s3Object, null, 2));

  // Retrieve the email from your bucket
  const req = {
    Bucket: BUCKET,
    Key: s3Object.key,
  };

  try {
    const data = await s3.getObject(req).promise();
    console.log('Raw email:\n' + data.Body);

    const parsed = await new Promise((res, rej) => {
      simpleParser(data.Body, (err, success) => {
        if (err) rej(err);
        res(success);
      });
    });
    console.log('date:', parsed.date);
    console.log('subject:', parsed.subject);
    console.log('body:', parsed.text);
    console.log('from:', parsed.from?.text);
    console.log('attachments:', parsed.attachments);

    const instance = await buildAxios();
    await instance.post(`${URL}/api/bridge/email/in`, parsed);
    callback(null, null);
  } catch (err) {
    console.log(err, err.stack);
    callback(err);
  }
};
