import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Your live AWS App Runner API endpoint
const PYTHON_API_URL = 'https://4esjyecm9k.ap-south-1.awsapprunner.com/predict'

serve(async (req) => {
  // This is needed to handle OPTIONS requests from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the activity data from the incoming request from your React app
    const activityData = await req.json()

    // 2. Call your deployed Python API on AWS
    const response = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    })

    // Check if the Python API call was successful
    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`)
    }

    const predictionResult = await response.json()

    // 3. Return the prediction from the Python API back to your React app
    return new Response(
      JSON.stringify(predictionResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})