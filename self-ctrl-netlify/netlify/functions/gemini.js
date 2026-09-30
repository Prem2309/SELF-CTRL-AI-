const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const apiKey = (data.apiKey || process.env.GEMINI_API_KEY || 'AIzaSyBoGT_yvMrm3NXbmzg05nurX8wd4xqeqj0').trim();
    const model = data.model || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const prompt = data.prompt;

    if (!apiKey) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'No Gemini API key available' })
      };
    }

    const modelsToTry = [model];
    const preferredFallbacks = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.8-flash'];
    for (const f of preferredFallbacks) {
      if (!modelsToTry.includes(f)) modelsToTry.push(f);
    }

    for (let i = 0; i < modelsToTry.length; i++) {
      const curModel = modelsToTry[i];
      try {
        const result = await makeGeminiRequest(apiKey, curModel, prompt);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(result)
        };
      } catch (err) {
        const msg = err.message || '';
        const isRetryable = /high demand|overloaded|unavailable|resource exhausted|quota|exceeded|rate limit|429/i.test(msg);
        if (!isRetryable || i === modelsToTry.length - 1) {
          return {
            statusCode: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: msg })
          };
        }
      }
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};

function makeGeminiRequest(apiKey, model, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 400 || json.error) {
            reject(new Error(json.error?.message || `HTTP ${res.statusCode}`));
            return;
          }
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('No text returned from Gemini API'));
            return;
          }
          let cleaned = text.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
          }
          resolve(JSON.parse(cleaned));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
