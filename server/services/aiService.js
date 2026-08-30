const { aiTriageOutputSchema } = require('../validators/ticket.validator');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Clean and extract JSON object from AI string output (handles markdown code fences ```json ... ```)
 * @param {string} rawText 
 * @returns {object|null}
 */
const extractJsonObject = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;

  try {
    return JSON.parse(rawText.trim());
  } catch (e) {
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (err) {
        return null;
      }
    }
  }

  const jsonBoundaryMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonBoundaryMatch) {
    try {
      return JSON.parse(jsonBoundaryMatch[0]);
    } catch (err) {
      return null;
    }
  }

  return null;
};

/**
 * Triage support ticket using OpenAI API (gpt-4o-mini)
 */
const triageTicketWithOpenAI = async (ticketData, apiKey, timeoutMs) => {
  console.log('[AI Agent] Analyzing ticket with OpenAI (gpt-4o-mini)...');

  const systemPrompt = `You are an AI Support Triage Agent for SupportFlow.
Your job is to automatically analyze customer support tickets, classify their priority and category level, and summarize the request.

STRICT CLASSIFICATION RULES:
- category MUST be one of: ["Billing", "Technical", "Account", "Order", "General"]
- priority MUST be one of: ["Low", "Medium", "High"]
  * High priority: Duplicate payments, refunds, system crashes, security issues, critical account lockouts.
  * Medium priority: Account questions, order tracking, standard technical questions.
  * Low priority: General feedback, documentation requests, non-urgent inquiries.
- summary MUST be a short useful summary (10 to 250 characters).

Return STRICT JSON ONLY.`;

  const userPrompt = `Subject: ${ticketData.subject}
Description: ${ticketData.description}
Customer Category Input: ${ticketData.category || 'General'}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Agent Error] OpenAI HTTP ${response.status}: ${errorText}`);
      return { success: false, error: `OpenAI HTTP ${response.status}` };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsedJson = extractJsonObject(content);

    if (!parsedJson) {
      return { success: false, error: 'Malformed JSON from OpenAI' };
    }

    const validation = aiTriageOutputSchema.safeParse(parsedJson);
    if (!validation.success) {
      const issues = validation.error.errors.map((e) => e.message).join(', ');
      return { success: false, error: `Invalid AI output: ${issues}` };
    }

    console.log('[AI Agent Success] AI Triage Result:', validation.data);
    return {
      success: true,
      suggestion: validation.data,
    };
  } catch (error) {
    clearTimeout(timer);
    const isTimeout = error.name === 'AbortError';
    return {
      success: false,
      error: isTimeout ? `Timeout after ${timeoutMs}ms` : error.message,
    };
  }
};

/**
 * Triage support ticket using Google Gemini API.
 */
const triageTicketWithGemini = async (ticketData, apiKey, timeoutMs) => {
  console.log('[AI Agent] Analyzing ticket with Google Gemini API...');

  const systemPrompt = `You are an AI support triage assistant for SupportFlow.
Analyze the support ticket below and categorize it into EXACTLY ONE category and priority level, and write a short summary.

STRICT CLASSIFICATION RULES:
- category MUST be one of: ["Billing", "Technical", "Account", "Order", "General"]
- priority MUST be one of: ["Low", "Medium", "High"]
- summary MUST be a short useful summary (1-2 sentences, 10 to 200 characters)

OUTPUT FORMAT: Return STRICT JSON ONLY.
Example JSON:
{
  "category": "Billing",
  "priority": "High",
  "summary": "Customer reported duplicate charge on recent order."
}

TICKET TO ANALYZE:
Subject: ${ticketData.subject}
Description: ${ticketData.description}
Customer Category Input: ${ticketData.category || 'General'}
`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 250,
        },
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Service Error] Gemini API HTTP ${response.status}: ${errorText}`);
      return { success: false, error: `Gemini API HTTP Error ${response.status}` };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedJson = extractJsonObject(candidateText);

    if (!parsedJson) {
      return { success: false, error: 'Malformed JSON response from Gemini' };
    }

    const validation = aiTriageOutputSchema.safeParse(parsedJson);
    if (!validation.success) {
      const issues = validation.error.errors.map((e) => e.message).join(', ');
      return { success: false, error: `Invalid AI output fields: ${issues}` };
    }

    console.log('[AI Service] Gemini triage successful:', validation.data);
    return {
      success: true,
      suggestion: validation.data,
    };
  } catch (error) {
    clearTimeout(timer);
    const isTimeout = error.name === 'AbortError';
    return {
      success: false,
      error: isTimeout ? `Gemini API call timed out after ${timeoutMs}ms` : error.message,
    };
  }
};

/**
 * Universal AI Triage dispatcher supporting OpenAI or Google Gemini keys.
 */
const triageTicketWithAI = async (ticketData, timeoutMs = 8000) => {
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openAiKey && openAiKey.startsWith('sk-')) {
    return await triageTicketWithOpenAI(ticketData, openAiKey, timeoutMs);
  }

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    return await triageTicketWithGemini(ticketData, geminiKey, timeoutMs);
  }

  console.warn('[AI Agent Warning] No valid OPENAI_API_KEY or GEMINI_API_KEY found. Triggering fallback.');
  return {
    success: false,
    error: 'AI API Key not configured',
  };
};

module.exports = {
  triageTicketWithAI,
  triageTicketWithGemini,
  extractJsonObject,
};
