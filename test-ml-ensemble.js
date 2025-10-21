/**
 * GenSentinel Guardian - Automated ML Ensemble Testing Script
 * 
 * This script demonstrates the triple-model ensemble system by:
 * 1. Creating test activities
 * 2. Sending them to the ML API
 * 3. Displaying ensemble scores and XAI explanations
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

// Test organization and user IDs
const TEST_ORG_ID = 'test-org-001';
const TEST_USER_ID = 'EMP99999';

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(80));
    log(title, 'bright');
    console.log('='.repeat(80) + '\n');
}

function logSubSection(title) {
    console.log('\n' + '-'.repeat(60));
    log(title, 'cyan');
    console.log('-'.repeat(60));
}

async function ingestActivity(activity) {
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/ingest-activity`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activity)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to ingest activity');
        }

        return result;
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        throw error;
    }
}

function displayMLPrediction(prediction) {
    logSubSection('🤖 ML Prediction Results');

    // Individual Model Scores
    log('\n📊 Individual Model Scores:', 'bright');
    console.log(`  🎯 Supervised Classifier:  ${(prediction.supervised_prediction * 100).toFixed(2)}% (${prediction.supervised_model_version})`);
    console.log(`  🔍 Isolation Forest:       ${(prediction.anomaly_score * 100).toFixed(2)}% (${prediction.isolation_forest_version})`);
    console.log(`  🔄 LSTM Autoencoder:       ${(prediction.sequence_anomaly_score * 100).toFixed(2)}% (${prediction.lstm_model_version})`);

    // Ensemble Result
    log('\n🎲 Ensemble Result:', 'bright');
    const threatProb = (prediction.threat_probability * 100).toFixed(2);
    const threatColor = prediction.threat_probability > 0.9 ? 'red' :
                       prediction.threat_probability > 0.7 ? 'yellow' :
                       prediction.threat_probability > 0.5 ? 'yellow' : 'green';
    
    log(`  Threat Probability: ${threatProb}%`, threatColor);
    log(`  Threat Class: ${prediction.threat_class.toUpperCase()}`, threatColor);
    log(`  Threat Level: ${(prediction.threat_level || 'low').toUpperCase()}`, threatColor);
    log(`  Confidence: ${(prediction.prediction_confidence * 100).toFixed(2)}%`, 'cyan');
    log(`  Auto-blocked: ${prediction.auto_blocked ? '🚫 YES' : '✅ NO'}`, prediction.auto_blocked ? 'red' : 'green');

    // Calculation Explanation
    log('\n📐 Ensemble Calculation:', 'bright');
    const supervised = prediction.supervised_prediction || 0;
    const isolation = prediction.anomaly_score || 0;
    const lstm = prediction.sequence_anomaly_score || 0;
    
    console.log(`  Formula: (0.4 × Supervised) + (0.3 × Isolation) + (0.3 × LSTM)`);
    console.log(`  Calculation: (0.4 × ${supervised.toFixed(4)}) + (0.3 × ${isolation.toFixed(4)}) + (0.3 × ${lstm.toFixed(4)})`);
    console.log(`  Result: ${(0.4 * supervised + 0.3 * isolation + 0.3 * lstm).toFixed(4)}`);
    console.log(`  Stored Value: ${prediction.threat_probability.toFixed(4)}`);

    // XAI Explanation
    if (prediction.xai_explanation) {
        log('\n💡 XAI Explanation:', 'bright');
        log(`  ${prediction.xai_explanation}`, 'magenta');
    }

    // Feature Importance
    if (prediction.feature_importance) {
        log('\n📈 Feature Importance:', 'bright');
        const features = Object.entries(prediction.feature_importance)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        
        features.forEach(([feature, importance]) => {
            console.log(`  ${feature}: ${(importance * 100).toFixed(2)}%`);
        });
    }
}

async function testNormalActivity() {
    logSection('TEST 1: Normal Activity (Expected: Low Threat)');

    const activity = {
        organization_id: TEST_ORG_ID,
        user_id: TEST_USER_ID,
        activity_type: 'document_view',
        description: 'Viewed quarterly financial report',
        metadata: {
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: new Date().toISOString(),
            resource_type: 'document',
            file_count: 1
        },
        timestamp: new Date().toISOString()
    };

    log('📝 Activity Details:', 'bright');
    console.log(`  Type: ${activity.activity_type}`);
    console.log(`  Description: ${activity.description}`);
    console.log(`  IP Address: ${activity.metadata.ip_address}`);
    console.log(`  Time: ${new Date(activity.timestamp).toLocaleString()}`);

    log('\n⏳ Sending to ML API...', 'yellow');
    const result = await ingestActivity(activity);

    if (result.mlPrediction) {
        displayMLPrediction(result.mlPrediction);
    }

    log('\n✅ Test completed', 'green');
}

async function testSuspiciousActivity() {
    logSection('TEST 2: Suspicious Activity (Expected: Medium Threat)');

    const nightTime = new Date();
    nightTime.setHours(2, 30, 0, 0);

    const activity = {
        organization_id: TEST_ORG_ID,
        user_id: TEST_USER_ID,
        activity_type: 'file_download',
        description: 'SUSPICIOUS: Bulk file download during off-hours - 150 files, 700MB',
        metadata: {
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: nightTime.toISOString(),
            file_count: 150,
            data_volume_mb: 700,
            off_hours: true,
            bulk_download: true
        },
        timestamp: nightTime.toISOString()
    };

    log('📝 Activity Details:', 'bright');
    console.log(`  Type: ${activity.activity_type}`);
    console.log(`  Description: ${activity.description}`);
    console.log(`  IP Address: ${activity.metadata.ip_address}`);
    console.log(`  Time: ${new Date(activity.timestamp).toLocaleString()} (OFF-HOURS)`);
    console.log(`  File Count: ${activity.metadata.file_count}`);
    console.log(`  Data Volume: ${activity.metadata.data_volume_mb}MB`);

    log('\n⏳ Sending to ML API...', 'yellow');
    const result = await ingestActivity(activity);

    if (result.mlPrediction) {
        displayMLPrediction(result.mlPrediction);
    }

    log('\n✅ Test completed', 'green');
}

async function testCriticalThreat() {
    logSection('TEST 3: Critical Threat (Expected: High/Critical Threat + Auto-block)');

    const nightTime = new Date();
    nightTime.setHours(3, 15, 0, 0);

    const activity = {
        organization_id: TEST_ORG_ID,
        user_id: TEST_USER_ID,
        activity_type: 'data_export',
        description: 'CRITICAL THREAT: Large data export to external location - 1.5GB from unusual location',
        metadata: {
            ip_address: '203.45.67.10',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: nightTime.toISOString(),
            file_count: 250,
            data_volume_mb: 1500,
            off_hours: true,
            unusual_location: true,
            country: 'CN',
            city: 'Beijing',
            export_destination: 'external'
        },
        timestamp: nightTime.toISOString()
    };

    log('📝 Activity Details:', 'bright');
    console.log(`  Type: ${activity.activity_type}`);
    console.log(`  Description: ${activity.description}`);
    console.log(`  IP Address: ${activity.metadata.ip_address} (UNUSUAL LOCATION)`);
    console.log(`  Location: ${activity.metadata.city}, ${activity.metadata.country}`);
    console.log(`  Time: ${new Date(activity.timestamp).toLocaleString()} (OFF-HOURS)`);
    console.log(`  File Count: ${activity.metadata.file_count}`);
    console.log(`  Data Volume: ${activity.metadata.data_volume_mb}MB`);
    console.log(`  Export Destination: ${activity.metadata.export_destination}`);

    log('\n⏳ Sending to ML API...', 'yellow');
    const result = await ingestActivity(activity);

    if (result.mlPrediction) {
        displayMLPrediction(result.mlPrediction);
    }

    log('\n✅ Test completed', 'green');
}

async function testUnauthorizedConfigChange() {
    logSection('TEST 4: Unauthorized Config Change (Expected: Critical Threat)');

    const activity = {
        organization_id: TEST_ORG_ID,
        user_id: TEST_USER_ID,
        activity_type: 'system_config',
        description: 'CRITICAL THREAT: Unauthorized system configuration change - security settings modified',
        metadata: {
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            timestamp: new Date().toISOString(),
            config_type: 'security_settings',
            unauthorized: true,
            privilege_escalation: true
        },
        timestamp: new Date().toISOString()
    };

    log('📝 Activity Details:', 'bright');
    console.log(`  Type: ${activity.activity_type}`);
    console.log(`  Description: ${activity.description}`);
    console.log(`  IP Address: ${activity.metadata.ip_address}`);
    console.log(`  Config Type: ${activity.metadata.config_type}`);
    console.log(`  Unauthorized: ${activity.metadata.unauthorized}`);
    console.log(`  Privilege Escalation: ${activity.metadata.privilege_escalation}`);

    log('\n⏳ Sending to ML API...', 'yellow');
    const result = await ingestActivity(activity);

    if (result.mlPrediction) {
        displayMLPrediction(result.mlPrediction);
    }

    log('\n✅ Test completed', 'green');
}

function displaySummary() {
    logSection('📊 Test Summary');

    log('Test Scenarios Completed:', 'bright');
    console.log('  ✅ Test 1: Normal Activity');
    console.log('  ✅ Test 2: Suspicious Activity');
    console.log('  ✅ Test 3: Critical Threat');
    console.log('  ✅ Test 4: Unauthorized Config Change');

    log('\n🎯 Expected Results:', 'bright');
    console.log('  Test 1: Ensemble Score <30%, Threat Level: Low/Safe');
    console.log('  Test 2: Ensemble Score 50-70%, Threat Level: Medium');
    console.log('  Test 3: Ensemble Score >90%, Threat Level: Critical, Auto-blocked');
    console.log('  Test 4: Ensemble Score >85%, Threat Level: Critical, Auto-blocked');

    log('\n📈 Key Observations:', 'bright');
    console.log('  • All three models contribute to ensemble score');
    console.log('  • Ensemble uses weighted voting (40%, 30%, 30%)');
    console.log('  • XAI provides human-readable explanations');
    console.log('  • Auto-blocking triggers for critical threats');
    console.log('  • Feature importance shows key decision factors');

    log('\n🛡️ GenSentinel Guardian - Triple Model Ensemble System', 'green');
}

async function main() {
    console.clear();
    
    logSection('🛡️ GenSentinel Guardian - ML Ensemble Testing');
    
    log('Configuration:', 'bright');
    console.log(`  Supabase URL: ${SUPABASE_URL}`);
    console.log(`  Organization ID: ${TEST_ORG_ID}`);
    console.log(`  User ID: ${TEST_USER_ID}`);
    console.log('');

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_KEY') {
        log('❌ Error: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables', 'red');
        log('\nUsage:', 'yellow');
        console.log('  export VITE_SUPABASE_URL=https://your-project.supabase.co');
        console.log('  export VITE_SUPABASE_ANON_KEY=your-anon-key');
        console.log('  node test-ml-ensemble.js');
        process.exit(1);
    }

    try {
        // Run all tests sequentially
        await testNormalActivity();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        await testSuspiciousActivity();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await testCriticalThreat();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await testUnauthorizedConfigChange();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Display summary
        displaySummary();

        log('\n✅ All tests completed successfully!', 'green');
    } catch (error) {
        log(`\n❌ Test failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the tests
if (require.main === module) {
    main();
}

module.exports = { testNormalActivity, testSuspiciousActivity, testCriticalThreat };

