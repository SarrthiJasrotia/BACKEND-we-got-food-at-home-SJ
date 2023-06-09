require('dotenv').config()
const {PORT,OPEN_API_KEY} =process.env

const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");



const configuration = new Configuration({

  apiKey: OPEN_API_KEY,


});
const openai = new OpenAIApi(configuration);

// Set up the server
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Set up the ChatGPT endpoint
app.post("/chat", async (req, res) => {
	// Get the prompt from the request
	const { prompt } = req.body;

	// Generate a response with ChatGPT
	const completion = await openai.createCompletion({
		model: 'text-davinci-002',
		prompt: prompt,
		max_tokens: 2048,
	});

	res.send(completion.data.choices[0].text);
});

// Start the server

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
