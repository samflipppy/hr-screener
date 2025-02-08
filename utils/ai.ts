import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateTest = async (jobRole: string) => {
  const prompt = `Create a short technical and personality test for a ${jobRole}.`;
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
  });
  return response.data.choices[0].message?.content;
};

export const evaluateTest = async (answers: string[]) => {
  const prompt = `Evaluate these test answers and determine if the candidate is a good fit: ${JSON.stringify(answers)}`;
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
  });
  return response.data.choices[0].message?.content;
};
