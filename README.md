# LLM Map Maker

Try the Build here: [Open Page](https://llm-map-test.netlify.app/)


## Description

This is an example of using an LLM (Gemini 1.5 Flash) with Tool Calling to work with a user to co-create maps. 

This was a test to see how well LLMs could place objects on a map and understand relations based on coordinates.

![example_trees](https://github.com/SentientDragon5/CMPM-118-LLM-Test/blob/main/example_images/example_trees.png)

This example that shows that multiple objects can be batch placed, however any more than 4 or 5 and the LLM gets confused.

![example_distance](https://github.com/SentientDragon5/CMPM-118-LLM-Test/blob/main/example_images/example_distance.png)

This example shows that relative distances can be used to place objects on the coordinate plane.

## Results

Gemini was able to use Langchain Tool Calling to create objects or backgrounds with an understanding of the other objects in the scene. The only way that this works though is from the context provided in the chat history though. This shows that it is easy to make an LLM remember locations based on text and coordinates, even if the LLM does not have direct read access to the map.


## Setup

- First make sure you have installed npm
- Run `npm install` in this directory
- Make sure to create a `.env` file with the following contents.

```
GOOGLE_API_KEY=<Api-Key>
VITE_GOOGLE_API_KEY=<Api-Key>
```

Both parameters are the same API key from [Google AI studio](https://aistudio.google.com/app/apikey). This repo uses Gemini 1.5 Flash, which is free.

## Testing

Run `npm run dev` to open vite.