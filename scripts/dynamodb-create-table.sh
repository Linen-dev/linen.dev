tableName=cache-staging

aws dynamodb create-table \
    --table-name $tableName \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST
    --output text

sleep 30

# this command need to wait for table been created
aws dynamodb update-time-to-live \
    --table-name $tableName \
    --time-to-live-specification Enabled=true,AttributeName=ttl