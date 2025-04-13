import boto3

# Code is taken and modified from Cloud Computing, Workshop 5. 
# Credits to Dr. Qiang Fu and the rest of the teaching team

# post requests should look like
# {
#   "type": "registerUser",
#   "item": {
#     "email": "student@example.com",
#     "user_name": "example",
#     "password": "example"
#   }
# }

# delete request should look like

def format_response(status_code, body_dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
        },
        "body": body_dict
    }

def lambda_handler(event, context):
    type = event['type'];
    # this will create dynamodb resource object and
    # here dynamodb is resource name
    client = boto3.resource('dynamodb')
  
    # this will search for dynamoDB table
    # your table name may be different
    loginTable = client.Table("login")
    subscriptionTable = client.Table("subscription")
  
    if type=="options":
        resp = format_response(200, { "message": 'CORS preflight successful' })
    elif type=="registerUser":
        item = event.get("item")
        if not item:
          return format_response(400, {"error": "Missing login item"})
        response = loginTable.put_item(Item=item)
        resp = format_response(200, response)
    elif type=="updateSubscription":
        item = event.get("item")
        if not item:
          return format_response(400, {"error": "Missing subscription item"})
        response = subscriptionTable.put_item(Item=item)
        resp = format_response(200, response)
    elif type=="deleteSubscription":
        email = event.get("email")
        sk = event.get("SK")
        if not email or not sk:
          return format_response(400, {"error": "Missing email or SK"})
        
        response = subscriptionTable.delete_item(Key={"email": email, "SK": sk})
        resp = format_response(200, response)
    else:
      return response(400, {"error": "Invalid request type"})
        
    return resp