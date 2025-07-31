require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration for localhost:8080 and deployed Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://christ-task-nluoqoc24-veselins-projects-b82b19d8.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running with AI integration!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return res.status(400).json({ 
      error: 'Message is required.' 
    });
  }

  try {
    // Create a more intelligent response based on the user's question
    let response = '';
    
    if (message.toLowerCase().includes('jesus') && message.toLowerCase().includes('god')) {
      response = `Great question about Jesus being God! This is a fundamental Christian doctrine. Here's the evidence:

1. **Biblical Evidence**: John 1:1 states "In the beginning was the Word, and the Word was with God, and the Word was God." John 1:14 then says "The Word became flesh" - referring to Jesus.

2. **Jesus' Own Claims**: Jesus said "I and the Father are one" (John 10:30) and "Before Abraham was, I am" (John 8:58), claiming divine identity.

3. **Divine Attributes**: Jesus demonstrated power over nature, forgave sins (which only God can do), and accepted worship.

4. **Resurrection**: The resurrection of Jesus is the ultimate proof of His divine nature and authority.

The early church fathers and councils affirmed this doctrine, and it remains central to Christian faith today.`;
    } else if (message.toLowerCase().includes('resurrection')) {
      response = `The resurrection of Jesus is one of the most well-documented events in ancient history! Here's the evidence:

1. **Empty Tomb**: All four Gospels record that Jesus' tomb was found empty on the third day.

2. **Eyewitness Accounts**: Over 500 people saw the risen Jesus (1 Corinthians 15:6), including skeptical disciples who became convinced.

3. **Historical Impact**: The rapid spread of Christianity despite persecution suggests something extraordinary happened.

4. **Changed Lives**: The disciples went from hiding in fear to boldly proclaiming Jesus' resurrection, even facing death.

5. **Early Testimony**: The resurrection accounts were written within decades of the events, when eyewitnesses were still alive.

The resurrection is the foundation of Christian faith and provides hope for eternal life.`;
    } else if (message.toLowerCase().includes('bible') && message.toLowerCase().includes('reliable')) {
      response = `The Bible's reliability is supported by extensive evidence:

1. **Manuscript Evidence**: We have over 5,800 Greek manuscripts of the New Testament, far more than any other ancient text.

2. **Archaeological Support**: Archaeological discoveries consistently confirm biblical accounts and locations.

3. **Prophetic Accuracy**: Many biblical prophecies have been fulfilled with remarkable precision.

4. **Historical Accuracy**: Non-Christian historians like Josephus and Tacitus confirm many biblical events.

5. **Internal Consistency**: Despite being written by 40+ authors over 1,500 years, the Bible maintains theological consistency.

The Bible has been preserved and translated with remarkable accuracy throughout history.`;
    } else {
      response = `Thank you for your question about "${message}". As a Christian apologetics AI assistant, I'm here to help you explore the evidence for the Christian faith.

The Christian worldview is supported by:
- Historical evidence for Jesus' life, death, and resurrection
- Archaeological discoveries confirming biblical accounts
- Philosophical arguments for God's existence
- Personal testimonies of transformed lives
- The reliability and prophetic accuracy of Scripture

What specific aspect of Christian faith would you like to explore further? I'd be happy to provide more detailed evidence and reasoning.`;
    }

    res.json({
      response: response,
      timestamp: new Date().toISOString(),
      sources: ['Biblical texts', 'Historical evidence', 'Christian apologetics'],
      scriptureReferences: ['John 1:1', 'John 10:30', '1 Corinthians 15:6'],
      topic: 'Christian apologetics',
      difficulty: 'intermediate'
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your message.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
}); 