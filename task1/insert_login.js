import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const main = async () => {

  for (let i = 0; i <= 9; i++) {
    const command = new PutCommand({
      TableName: "login",
      Item: {
        email: `s3953344${i}@student.rmit.edu.au`,
        user_name: `FrederickHadi${i}`,
        password: `${(0+i)%10}${(1+i)%10}${(2+i)%10}${(3+i)%10}${(4+i)%10}${(5+i)%10}`,
      },
    });
  
    const response = await docClient.send(command);
    console.log(response);
  }

  // return response;
};

main().catch(console.error);