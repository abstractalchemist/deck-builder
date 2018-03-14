import AWS from 'aws-sdk'

AWS.config.region = 'us-west-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
   IdentityPoolId: 'us-west-2:3a222ba4-1c88-485d-aea8-ade0015fa33b',
   });

let db_interface;
if(process.env.NODE_ENV !== 'production')
   db_interface = new AWS.DynamoDB({ endpoint: 'http://localhost:8000' })
else
   db_interface = new AWS.DynamoDB()

export default db_interface
