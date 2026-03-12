
import * as dotenv from 'dotenv';
dotenv.config();

import { gemini15Flash, ai } from '../src/ai/genkit';

async function testModel() {
  console.log('Testing configured model...');
  console.log('Using configured model reference:', gemini15Flash); // This should be 'googleai/gemini-2.5-flash'
  
  try {
    const { text } = await ai.generate({
      model: gemini15Flash, 
      prompt: 'Hello, are you Gemini 2.5 Flash?',
      config: { temperature: 0.1 }
    });
    console.log('Success! Response:', text);
  } catch (error) {
    console.error('Failed to generate content:', error);
    process.exit(1);
  }
}

testModel();
