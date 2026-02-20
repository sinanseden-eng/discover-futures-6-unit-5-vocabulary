export const handler = async (event) => {
  // Only allow POST requests from our website
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const userPrompt = requestBody.prompt;
    
    // 🔒 Securely pull the API key from Netlify Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { 
          statusCode: 500, 
          body: JSON.stringify({ error: { message: "Missing API Key in Netlify Settings" } }) 
      };
    }

    // 🚨 CRITICAL FIX 1: Use the standard public model 'gemini-1.5-flash'
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: userPrompt }] }] };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 🚨 CRITICAL FIX 2: If Google throws an error (e.g., 400 or 403), forward that exact error status to the frontend!
    if (!response.ok) {
        return {
            statusCode: response.status,
            body: JSON.stringify(data)
        };
    }

    // Success! Send the result back to our HTML file
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
