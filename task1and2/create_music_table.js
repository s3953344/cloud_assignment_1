import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

// code modified from AWS Docs
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html

// node create_music_table.js to run

const client = new DynamoDBClient({});

export const main = async () => {
  const command = new CreateTableCommand({
    TableName: "music",
    // For more information about data types,
    // see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html#HowItWorks.DataTypes and
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
    AttributeDefinitions: [
      {
        AttributeName: "title",
        AttributeType: "S",
      },
      {
        AttributeName: "album",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      // we choose title for PK for its high cardinality
      {
        AttributeName: "title",
        KeyType: "HASH",
      },
      {
        AttributeName: "album",
        KeyType: "RANGE",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });

  const response = await client.send(command);
  console.log(response);
  return response;
};

main().catch(console.error);