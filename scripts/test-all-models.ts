
import * as dotenv from 'dotenv';
dotenv.config();

import { ai } from '../src/ai/genkit';

async function testModel(model: string) {
  console.log(`\nTesting model: ${model}...`);
  try {
    const { text } = await ai.generate({
      model: model, 
      prompt: 'Hello, are you working?',
      config: { temperature: 0.1 }
    });
    console.log(`✅ Success! Response from ${model}:`, text.slice(0, 50) + '...');
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate with ${model}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function run() {
  const models = [
    'googleai/gemini-2.5-flash',
    'googleai/gemini-2.5-flash-lite',
    'googleai/gemini-3.1-flash-lite-preview',
    'googleai/gemini-3-flash-preview' // Checking specific version if needed
  ];

  for (const model of models) {
    await testModel(model);
  }
}

run();
