const express = require("express");
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const PORT = 3000;

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


// const client = new DynamoDBClient({region: "us-east-1", "credentials": creds});
const client = new DynamoDBClient({});
// Create the DynamoDB Document Client
const docClient = DynamoDBDocumentClient.from(client);

app.get("/api/login", async (req, res) => {
  const { email, password } = req.query;

  const command = new GetCommand({
    TableName: "login",
    Key: {
      "email": email,
    },
  });

  const response = await docClient.send(command);

  if (response.Item?.password === password) {
    console.log("Login successful!");
    res.send(response.Item);
  } else {
    console.log("Login failed. Username or password is incorrect.");
    res.status(401).send("Login failed. Username or password is incorrect.");
  }

})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
