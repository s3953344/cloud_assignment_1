import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { readFile } from 'node:fs/promises';

// code based on AWS docs
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-2.html

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const main = async () => {
  try {
    const { songs } = JSON.parse(await readFile('2025a1.json', 'utf8'));
    songs.forEach(async (song) => {
      const command = new PutCommand({
        TableName: "music",
        Item: song,
      });
    
      const response = await docClient.send(command);
      console.log(response);
    })


  } catch (err) {
    console.error(`Error reading JSON file: ${err}`);
  }
};

main().catch(console.error);