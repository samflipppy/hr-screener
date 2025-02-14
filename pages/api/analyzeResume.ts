import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, jobDescription, jobPreferences } = req.body;

    const prompt = `
      Analyze this resume for the following job position:
      
      Job Description:
      ${jobDescription}
      
      Job Preferences:
      ${jobPreferences}
      
      Resume Text:
      ${resumeText}
      
      Please provide detailed feedback on:
      1. How well the candidate matches the job requirements
      2. Key strengths and relevant experience
      3. Areas where the candidate might need improvement
      4. Overall fit for the position
      
      Format the response in clear sections with bullet points where appropriate.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const feedback = completion.choices[0].message.content;
    res.status(200).json({ feedback });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
} 