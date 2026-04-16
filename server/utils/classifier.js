const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const OpenAI = require('openai');

/**
 * Safe JSON parsing with fallback
 * @param {string} text 
 * @param {Object} fallback 
 * @returns {Object}
 */
const safeParse = (text, fallback = { label: 'not spam', department: 'Other', confidence: 0, reason: 'Parsing failed' }) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    // Normalize fields
    return {
      label: (parsed.label || fallback.label).toLowerCase(),
      department: normalizeDepartment(parsed.department),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : parseFloat(parsed.confidence) || 0,
      reason: parsed.reason || fallback.reason
    };
  } catch (err) {
    console.error('JSON Parse Error:', err.message, 'Raw text:', text);
    return fallback;
  }
};

/**
 * Normalize department to match allowed enums
 * @param {string} dept 
 * @returns {string}
 */
const normalizeDepartment = (dept) => {
  const validDepts = ['Maths department', 'CS department', 'Management department', 'Science department'];
  if (!dept) return 'Other';
  
  const found = validDepts.find(d => 
    dept.toLowerCase().includes(d.split(' ')[0].toLowerCase())
  );
  return found || 'Other';
};

/**
 * Wrapper for async calls with timeout
 * @param {Promise} promise 
 * @param {number} ms 
 * @returns {Promise}
 */
const withTimeout = (promise, ms = 15000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('LLM_TIMEOUT')), ms)
  );
  return Promise.race([promise, timeout]);
};

/**
 * Main classification logic
 */
const classifyMessage = async (subject, snippet, selectedModel, keys = {}) => {
  const modelId = selectedModel || 'llama-3.3-70b-versatile';
  const text = `Subject: ${subject}\nSnippet: ${snippet}`;
  
  const prompt = `Act as a Naive Bayes Classifier. Classify based on word frequency and spam patterns:
  
  EXAMPLES:
  1. "Your exam schedule for Advanced Calculus is attached" -> Label: "not spam", Dept: "Maths department"
  2. "New Python internship opening at Tech Corp" -> Label: "not spam", Dept: "CS department"
  3. "Winning lottery ticket #4920 inside! Click to claim $50k" -> Label: "spam", Dept: "Other"
  4. "Quarterly budget meeting moved to Tuesday" -> Label: "not spam", Dept: "Management department"
  
  CRITERIA:
  - SPAM: High frequency of tokens like "Free", "Lottery", "Urgent", "Click here", "Action required".
  - NOT SPAM: Natural conversation, academic or professional patterns.

  Strict JSON output only:
  {
    "label": "spam" or "not spam",
    "department": "Maths department" | "CS department" | "Management department" | "Science department" | "Other",
    "confidence": number,
    "reason": "Explain using probability patterns"
  }

  DATA:
  "${text}"`;

  try {
    let responseText;
    
    const callLLM = async () => {
      if (modelId.startsWith('gpt')) {
        const apiKey = keys.openAIKey || process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('MISSING_API_KEY');
        const client = new OpenAI({ apiKey });
        const comp = await client.chat.completions.create({ 
          model: modelId, 
          messages: [{role:'user', content:prompt}], 
          response_format: {type:'json_object'} 
        });
        return comp.choices[0].message.content;
      } else if (modelId.startsWith('llama')) {
        const apiKey = keys.groqKey || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error('MISSING_API_KEY');
        const groqInstance = new Groq({ apiKey });
        const comp = await groqInstance.chat.completions.create({ 
          model: modelId, 
          messages: [{role:'user', content:prompt}], 
          response_format: {type:'json_object'} 
        });
        return comp.choices[0].message.content;
      } else {
        const apiKey = keys.geminiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('MISSING_API_KEY');
        const genAIInstance = new GoogleGenerativeAI(apiKey);
        const model = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const res = await model.generateContent(prompt);
        return await res.response.text();
      }
    };

    responseText = await withTimeout(callLLM(), 20000);
    return safeParse(responseText);

  } catch (err) {
    console.error(`❌ Bayes analysis error [${modelId}]:`, err.message);
    if (err.message === 'LLM_TIMEOUT') {
      return { label: 'not spam', department: 'Other', confidence: 0, reason: 'LLM request timed out' };
    }
    return { label: 'not spam', department: 'Other', confidence: 0, reason: `Classification failed: ${err.message}` };
  }
};

module.exports = {
  classifyMessage,
  safeParse,
  withTimeout
};
