import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const DEFAULT_PYTHON_API_URL = 'https://4esjyecm9k.ap-south-1.awsapprunner.com/predict'

function coerceProbability01(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  if (!Number.isFinite(n)) return undefined
  if (n > 1) return Math.min(1, n / 100)
  return Math.min(1, Math.max(0, n))
}

/** Merge Python / AWS response variants into the shape ingest-activity and the UI expect. */
function normalizePythonPrediction(raw: Record<string, unknown>): Record<string, unknown> {
  const probCandidates = [
    coerceProbability01(raw.threat_probability),
    coerceProbability01(raw.threatProbability),
    coerceProbability01(raw.ensemble_probability),
    coerceProbability01(raw.ensembleProbability),
    coerceProbability01(raw.final_risk_score),
    coerceProbability01(raw.finalRiskScore),
  ].filter((x): x is number => x !== undefined)

  const threat_probability = probCandidates.length > 0 ? Math.min(1, Math.max(...probCandidates)) : 0

  let anomaly_score = coerceProbability01(raw.anomaly_score) ?? coerceProbability01(raw.anomalyScore)
  const ifRaw = raw.isolation_forest_score ?? raw.isolationForestScore
  if (anomaly_score === undefined && typeof ifRaw === 'number' && Number.isFinite(ifRaw)) {
    // sklearn IF decision_function: lower (more negative) = more anomalous
    anomaly_score = Math.min(1, Math.max(0, -ifRaw))
  }

  let sequence_anomaly_score =
    coerceProbability01(raw.sequence_anomaly_score) ?? coerceProbability01(raw.sequenceAnomalyScore)
  const lstmErr = raw.lstm_reconstruction_error ?? raw.lstmReconstructionError
  if (sequence_anomaly_score === undefined && lstmErr != null) {
    sequence_anomaly_score = coerceProbability01(lstmErr) ?? Math.min(1, Math.max(0, Number(lstmErr)))
  }

  const existingMv = raw.model_versions as Record<string, string> | undefined
  const model_versions = {
    supervised: existingMv?.supervised ?? 'aws-ensemble-v1',
    isolation_forest: existingMv?.isolation_forest ?? 'aws-if-v1',
    lstm: existingMv?.lstm ?? 'aws-lstm-v1',
  }

  const supervised_raw = raw.supervised_prediction ?? raw.supervisedPrediction
  let supervised_prediction: string | undefined
  if (typeof supervised_raw === 'string' && supervised_raw.length > 0) {
    supervised_prediction = supervised_raw
  } else if (typeof supervised_raw === 'number' && Number.isFinite(supervised_raw)) {
    supervised_prediction = String(supervised_raw)
  } else {
    supervised_prediction = threat_probability >= 0.5 ? 'threat' : 'safe'
  }

  const is_threat_raw = raw.is_threat ?? raw.isThreat
  const is_threat =
    typeof is_threat_raw === 'boolean' ? is_threat_raw : threat_probability >= 0.5

  const ensemble_confidence =
    coerceProbability01(raw.ensemble_confidence) ??
    coerceProbability01(raw.confidence) ??
    coerceProbability01(raw.prediction_confidence) ??
    0.75

  return {
    ...raw,
    threat_probability,
    anomaly_score: anomaly_score ?? null,
    sequence_anomaly_score: sequence_anomaly_score ?? null,
    supervised_prediction,
    is_threat,
    model_versions,
    ensemble_confidence,
    threat_type: (raw.threat_type ?? raw.threatType) as string | undefined,
    threat_level: (raw.threat_level ?? raw.threatLevel) as string | undefined,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const activityData = await req.json()

    const PYTHON_API_URL = Deno.env.get('PYTHON_ML_API_URL') ?? DEFAULT_PYTHON_API_URL

    const response = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    })

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`)
    }

    const predictionResult = (await response.json()) as Record<string, unknown>
    const normalized = normalizePythonPrediction(predictionResult)

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
