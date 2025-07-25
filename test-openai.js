require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
  try {
    const models = await openai.models.list();
    console.log('OpenAI key works! Models:', models.data.map(m => m.id));
  } catch (err) {
    console.error('OpenAI key test failed:', err);
  }
})(); 