exports.handler = async function(event, context) {
  const key = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KyMFTgkChsn3s2We_SPO6_hQUr5neSIqorfj_CU7DX1w';
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      hasKey: Boolean(key),
      model: model,
      maskedKey: key ? key.slice(0, 6) + '...' + key.slice(-4) : ''
    })
  };
};
