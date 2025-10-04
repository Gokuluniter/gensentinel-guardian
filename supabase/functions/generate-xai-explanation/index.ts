import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const {
      profile_id,
      activity_type,
      description,
      score,
      previous_score,
      threat_level
    } = await req.json();

    console.log('Generating XAI explanation for:', { profile_id, activity_type, threat_level });

    const prompt = `You are a security analyst AI assistant explaining why a security alert was triggered. 
    
Context:
- Activity Type: ${activity_type}
- Description: ${description}
- Security Score Changed: ${previous_score} → ${score} (dropped by ${previous_score - score} points)
- Threat Level: ${threat_level}

Provide a clear, concise explanation that:
1. Explains what triggered the alert in simple terms
2. Describes why this behavior is considered suspicious or risky
3. Suggests 2-3 specific actions the user should take
4. Reassures them if this was legitimate activity

Keep the explanation under 150 words and use a professional but friendly tone.`;

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
            content: 'You are an expert security analyst providing clear, actionable explanations of security alerts.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    console.log('XAI explanation generated successfully');

    return new Response(
      JSON.stringify({ 
        explanation,
        profile_id,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-xai-explanation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});