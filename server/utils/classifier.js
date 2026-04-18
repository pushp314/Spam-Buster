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

const normalizeDepartment = (dept) => {
  const validDepts = [
    { key: 'Maths department', keywords: ['math', 'calc', 'algebra', 'statistic', 'geometry', 'arithmetic'] },
    { key: 'CS department', keywords: ['computer', 'programming', 'code', 'python', 'java', 'web', 'software', 'ai', 'tech'] },
    { key: 'Management department', keywords: ['management', 'business', 'mba', 'hr', 'marketing', 'finance', 'budget', 'meeting'] },
    { key: 'Science department', keywords: ['science', 'physics', 'chem', 'bio', 'lab', 'research', 'experiment'] }
  ];
  
  if (!dept) return 'Other';
  const lowerDept = dept.toLowerCase();
  
  const found = validDepts.find(d => 
    lowerDept.includes(d.key.split(' ')[0].toLowerCase()) || 
    d.keywords.some(k => lowerDept.includes(k))
  );
  
  return found ? found.key : 'Other';
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
  const prompt = `You are a specialized email classifier for a university system. 
  Your goal is to categorize incoming emails based on their SUBJECT and CONTENT into specific academic departments.

  DEPARTMENTS:
  - "Maths department": Algebra, Calculus, Statistics, Mathematics courses, Exams.
  - "CS department": Computer Science, Programming, Coding, AI, Web Dev, Software.
  - "Management department": Business, MBA, Finance, HR, Meetings, Administration.
  - "Science department": Physics, Chemistry, Biology, Lab work, Research.
  - "Other": Use for anything else, general spam, or non-departmental mail.

  SPAM CLASSIFICATION:
  Identify as "spam" if the email contains promotional offers, phishing links, lottery wins, or irrelevant urgent requests.

  STRICT JSON OUTPUT:
  {
    "label": "spam" | "not spam",
    "department": "Maths department" | "CS department" | "Management department" | "Science department" | "Other",
    "confidence": number,
    "reason": "Short reason for this classification"
  }

  EMAIL TO CLASSIFY:
  Subject: ${subject}
  Content: ${snippet}`;

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
