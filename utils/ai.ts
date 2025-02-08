import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateTest = async (jobRole: string) => {
  const prompt = `Create a short technical and personality test for a ${jobRole}.`;
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
  });
  return response.choices[0].message?.content;
};

export const evaluateTest = async (answers: string[]) => {
  const prompt = `Evaluate these test answers and determine if the candidate is a good fit: ${JSON.stringify(answers)}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "system", content: prompt }],
  });
  return response.choices[0].message?.content;
};
