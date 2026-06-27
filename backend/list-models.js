require('dotenv').config();

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in your .env file.");
    return;
  }

  console.log(`Using API Key starting with: ${apiKey.substring(0, 5)}...`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Google API Error Details:");
      console.error(JSON.stringify(data.error, null, 2));
    } else {
      console.log("✅ Connection Successful! Available Models:");
      data.models.forEach(m => console.log("- " + m.name));
    }
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
  }
}
list();