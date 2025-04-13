import boto3

# event is structured like:
# { 
#   type: 'registerUser',
#   body: {
#     email: ...,
#     etc...
# }
def lambda_handler(event, context):
    type = event['type'];
    body = event['body'];
    # this will create dynamodb resource object and
    # here dynamodb is resource name
    client = boto3.resource('dynamodb')
  
    # this will search for dynamoDB table
    # your table name may be different
    loginTable = client.Table("login")
    subscriptionTable = client.Table("subscription")
  
    if type=="registerUser":
        # db_value=loginTable.get_item(Key={'email': body["email"]})['Item']['Count']
        item = body.get("item")
        if not item:
          return response(400, {"error": "Missing login item"})
        response = loginTable.put_item(Item=item)
        resp = {
          'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': {
                'message': "User has been registered!"
            }
        }
    elif type=="updateSubscription":
        item = body.get("item")
        if not item:
          return response(400, {"error": "Missing subscription item"})
        response = subscriptionTable.put_item(Item=item)
        resp = {
          'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': {
                'message': "Subscription has been added"
            }
        }
    elif type=="deleteSubscription":
        email = body.get("email")
        sk = body.get("SK")
        if not email or not sk:
          return response(400, {"error": "Missing email or SK"})
        
        response = subscriptionTable.delete_item(Key={"email": email, "SK": sk})
        resp = {
          'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': {
                'message': "Subscription has been added"
            }
        }
    elif type=="options":
        # db_value=table.get_item(Key={'id': id})['Item']['Count']
        resp = {
          'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            'body': {
                # 'Count': db_value
                'message': 'CORS is ok'
            }
        }
    else:
      return response(400, {"error": "Missing email or SK"})
        
    return resp


