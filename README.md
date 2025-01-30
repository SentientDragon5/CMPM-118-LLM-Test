**LLM Map Maker**

Build hosted on Netlify!
[Open Page](https://llm-map-test.netlify.app/)

This is an example of using an LLM (Gemini 1.5 Flash) with Tool Calling.

**Setup**

First make sure you have installed npm

Run `npm install` in this directory

Make sure to create a `.env` file with the following contents.

`GOOGLE_API_KEY=<Api-Key>`

`VITE_GOOGLE_API_KEY=<Api-Key>`

Both parameters are the same API key from [Google AI studio](https://aistudio.google.com/app/apikey). This repo uses Gemini 1.5 Flash, which is free.

**Testing**

Run `npm run dev` to open vite.