const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌐 RAG Chatbot URL Adder');
console.log('Add websites to your RAG chatbot knowledge base\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const urls = [];
  
  console.log('Enter the URLs you want to add (press Enter twice when done):\n');
  
  while (true) {
    const url = await askQuestion('Enter URL (or press Enter to finish): ');
    
    if (!url.trim()) {
      break;
    }
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.push(url);
      console.log(`✅ Added: ${url}`);
    } else {
      console.log('❌ Please enter a valid URL starting with http:// or https://');
    }
  }
  
  if (urls.length === 0) {
    console.log('No URLs provided. Exiting.');
    rl.close();
    return;
  }
  
  console.log(`\n📝 You want to add ${urls.length} URLs:`);
  urls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  const confirm = await askQuestion('\nProceed with ingestion? (y/n): ');
  
  if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
    console.log('\n🚀 Starting ingestion...');
    console.log('Run this command to ingest the URLs:');
    console.log('\nnode scripts/ingest-urls.js');
    
    // Update the ingest-urls.ts file with the new URLs
    const ingestFile = path.join(__dirname, 'ingest-urls.ts');
    if (fs.existsSync(ingestFile)) {
      let content = fs.readFileSync(ingestFile, 'utf8');
      
      // Replace the URLS_TO_INGEST array
      const urlArray = urls.map(url => `  '${url}',`).join('\n');
      const newUrlsSection = `const URLS_TO_INGEST = [\n${urlArray}\n  // Add more URLs here:\n  // 'https://example.com/page1',\n  // 'https://example.com/page2',\n];`;
      
      content = content.replace(
        /const URLS_TO_INGEST = \[[\s\S]*?\];/,
        newUrlsSection
      );
      
      fs.writeFileSync(ingestFile, content);
      console.log('\n✅ Updated ingest-urls.ts with your URLs');
    }
  } else {
    console.log('❌ Cancelled.');
  }
  
  rl.close();
}

main().catch(console.error); 