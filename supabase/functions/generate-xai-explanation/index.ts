import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Generate XAI explanation using available AI providers
 * Priority: Lovable API → Google Gemini Direct → Fallback explanation
 */
async function generateExplanation(
  activity_type: string,
  description: string,
  score: number,
  previous_score: number,
  threat_level: string,
  ml_prediction?: any
): Promise<{ explanation: string; provider: string }> {
  
  const prompt = `You are a cybersecurity AI analyst explaining a security alert to a non-technical user.

**Security Event Context:**
- Activity Type: ${activity_type}
- Description: ${description}
- Security Score: ${previous_score} → ${score} (${previous_score > score ? 'decreased by ' + (previous_score - score) : 'increased by ' + (score - previous_score)} points)
- Threat Level: ${threat_level?.toUpperCase() || 'UNKNOWN'}
${ml_prediction ? `- ML Threat Probability: ${(ml_prediction.threat_probability * 100).toFixed(1)}%` : ''}
${ml_prediction?.threat_type ? `- Threat Type: ${ml_prediction.threat_type}` : ''}

**Your Task:**
Provide a clear, actionable explanation (150-200 words) that:

1. **What Happened**: Explain the suspicious activity in simple terms
2. **Why It's Concerning**: Describe the security risk and why ML models flagged it
3. **Recommended Actions**: List 2-3 specific steps the user or admin should take
4. **Context**: If this could be legitimate, mention when/how to verify it

Use a professional but friendly tone. Be specific and actionable. Use emojis sparingly for readability.`;

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

  // Try Lovable AI Gateway first (preferred)
  if (LOVABLE_API_KEY) {
    try {
      console.log('🔄 Attempting Lovable AI Gateway...');
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert cybersecurity analyst providing clear, actionable explanations of security alerts to help users understand and respond to threats.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 400
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const explanation = data.choices[0].message.content;
        console.log('✅ Lovable AI Gateway success');
        return { explanation, provider: 'lovable_ai_gateway' };
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Lovable AI Gateway failed:', response.status, errorText);
      }
    } catch (error) {
      console.warn('⚠️ Lovable AI Gateway error:', error);
    }
  }

  // Fallback to direct Google Gemini API
  if (GEMINI_API_KEY) {
    try {
      console.log('🔄 Attempting Google Gemini API (direct)...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert cybersecurity analyst providing clear, actionable explanations of security alerts.\n\n${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
            topP: 0.95,
            topK: 40
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const explanation = data.candidates[0].content.parts[0].text;
        console.log('✅ Google Gemini API (direct) success');
        return { explanation, provider: 'google_gemini_direct' };
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Google Gemini API failed:', response.status, errorText);
      }
    } catch (error) {
      console.warn('⚠️ Google Gemini API error:', error);
    }
  }

  // Ultimate fallback: Generate a basic explanation
  console.log('⚠️ All AI providers failed, using fallback explanation');
  const fallbackExplanation = generateFallbackExplanation(
    activity_type, 
    description, 
    score, 
    previous_score, 
    threat_level,
    ml_prediction
  );
  
  return { explanation: fallbackExplanation, provider: 'fallback' };
}

/**
 * Generate a rule-based explanation when AI providers are unavailable
 */
function generateFallbackExplanation(
  activity_type: string,
  description: string,
  score: number,
  previous_score: number,
  threat_level: string,
  ml_prediction?: any
): string {
  const scoreDrop = previous_score - score;
  const threatProb = ml_prediction?.threat_probability || 0;

  let explanation = `**Security Alert: ${threat_level?.toUpperCase() || 'SUSPICIOUS'} Activity Detected**\n\n`;
  
  explanation += `**What Happened:**\n`;
  explanation += `Our machine learning models detected suspicious activity: "${description}". `;
  explanation += `Your security score ${scoreDrop > 0 ? `dropped by ${scoreDrop} points` : `changed`} from ${previous_score} to ${score}.\n\n`;
  
  explanation += `**Why This Matters:**\n`;
  if (threatProb > 0.8) {
    explanation += `This activity shows a very high threat probability (${(threatProb * 100).toFixed(1)}%). `;
  } else if (threatProb > 0.5) {
    explanation += `This activity shows moderate threat indicators. `;
  }
  explanation += `Our AI models analyze behavioral patterns, access patterns, and historical data to identify potential security risks.\n\n`;
  
  explanation += `**Recommended Actions:**\n`;
  explanation += `1. Review your recent activities in the Activity Log\n`;
  explanation += `2. If this was not you, contact your security administrator immediately\n`;
  explanation += `3. Consider changing your password if you suspect unauthorized access\n\n`;
  
  explanation += `**Need Help?** Contact your security team for assistance.`;
  
  return explanation;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      profile_id,
      activity_type,
      description,
      score,
      previous_score,
      threat_level,
      ml_prediction
    } = await req.json();

    console.log('🧠 Generating XAI explanation for:', { 
      profile_id, 
      activity_type, 
      threat_level,
      has_ml_data: !!ml_prediction 
    });

    const { explanation, provider } = await generateExplanation(
      activity_type,
      description,
      score,
      previous_score,
      threat_level,
      ml_prediction
    );

    console.log(`✅ XAI explanation generated via ${provider}`);

    return new Response(
      JSON.stringify({ 
        explanation,
        profile_id,
        provider,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in generate-xai-explanation:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        explanation: 'Unable to generate AI explanation at this time. Please contact your security administrator for details.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});