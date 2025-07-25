require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

// Validate OpenAI API key
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) {
  throw new Error("Missing OpenAI API key");
}

const openai = new OpenAI({ apiKey });

(async () => {
  try {
    const models = await openai.models.list();
    console.log('OpenAI key works! Models:', models.data.map(m => m.id));
  } catch (err) {
    console.error('OpenAI key test failed:', err);
  }
})(); 