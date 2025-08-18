// Mundo Tango Life CEO - TestSprite AI Testing Integration
// 53x21s Framework: Layer 53 (AI Testing) Implementation

const axios = require('axios');
const { db } = require('../server/db');
const { testResults } = require('../shared/schema');

class TestSpriteIntegration {
  constructor() {
    this.apiKey = process.env.TESTSPRITE_API_KEY;
    this.baseUrl = 'https://api.testsprite.com/v1';
    this.projectId = 'mundo-tango-life-ceo';
  }

  // Initialize TestSprite project
  async initializeProject() {
    try {
      const response = await axios.post(
        `${this.baseUrl}/projects`,
        {
          name: this.projectId,
          description: 'Mundo Tango Life CEO - Comprehensive AI Testing',
          framework: '53x21s',
          testTypes: [
            'functional',
            'security',
            'performance',
            'accessibility',
            'mobile',
            'api',
            'integration'
          ],
          autoHealing: true,
          coverage: {
            minimum: 90,
            target: 96
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('🧪 TestSprite project initialized:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ TestSprite initialization failed:', error.message);
      throw error;
    }
  }

  // Start comprehensive test cycle
  async startTestCycle(testConfig = {}) {
    const defaultConfig = {
      testSuite: 'comprehensive',
      environments: ['development', 'staging'],
      browsers: ['chrome', 'firefox', 'safari', 'mobile'],
      testTypes: [
        'smoke',
        'regression',
        'security',
        'performance',
        'accessibility',
        'mobile-responsiveness',
        'api-validation'
      ],
      coverage: {
        target: 96,
        failBelow: 85
      },
      aiFeatures: {
        selfHealing: true,
        intelligentRetries: true,
        adaptiveSelectors: true,
        performanceOptimization: true
      }
    };

    const config = { ...defaultConfig, ...testConfig };

    try {
      const response = await axios.post(
        `${this.baseUrl}/projects/${this.projectId}/test-cycles`,
        config,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const testCycleId = response.data.id;
      console.log(`🚀 TestSprite test cycle started: ${testCycleId}`);
      
      // Store test cycle info in database
      await this.storeTestCycle(testCycleId, config);
      
      return testCycleId;
    } catch (error) {
      console.error('❌ Failed to start test cycle:', error.message);
      throw error;
    }
  }

  // Store test cycle information
  async storeTestCycle(testCycleId, config) {
    try {
      await db.insert(testResults).values({
        testCycleId,
        status: 'running',
        startedAt: new Date(),
        config: JSON.stringify(config),
        framework: '53x21s'
      });
    } catch (error) {
      console.error('❌ Failed to store test cycle:', error.message);
    }
  }

  // Get test cycle status
  async getTestStatus(testCycleId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/projects/${this.projectId}/test-cycles/${testCycleId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to get test status:', error.message);
      throw error;
    }
  }

  // Process webhook notifications from TestSprite
  async processWebhook(webhookData) {
    const { testCycleId, status, results, coverage, insights } = webhookData;

    try {
      // Update test results in database
      await db.update(testResults)
        .set({
          status,
          results: JSON.stringify(results),
          coverage: coverage?.percentage || 0,
          completedAt: status === 'completed' ? new Date() : null,
          insights: JSON.stringify(insights)
        })
        .where(eq(testResults.testCycleId, testCycleId));

      // Trigger actions based on results
      if (status === 'completed') {
        await this.handleTestCompletion(testCycleId, results, coverage);
      }

      console.log(`📊 TestSprite results updated for cycle: ${testCycleId}`);
    } catch (error) {
      console.error('❌ Failed to process webhook:', error.message);
    }
  }

  // Handle test completion actions
  async handleTestCompletion(testCycleId, results, coverage) {
    const coveragePercentage = coverage?.percentage || 0;
    const passedTests = results?.summary?.passed || 0;
    const failedTests = results?.summary?.failed || 0;
    const totalTests = passedTests + failedTests;

    console.log(`✅ Test cycle ${testCycleId} completed:`);
    console.log(`   Coverage: ${coveragePercentage}%`);
    console.log(`   Passed: ${passedTests}/${totalTests}`);

    // Trigger notifications if coverage below threshold
    if (coveragePercentage < 90) {
      await this.triggerCoverageAlert(testCycleId, coveragePercentage);
    }

    // Auto-trigger regression if critical failures
    const criticalFailures = results?.critical || [];
    if (criticalFailures.length > 0) {
      await this.triggerCriticalFailureResponse(testCycleId, criticalFailures);
    }

    // Update n8n workflow if configured
    if (process.env.N8N_BASE_URL) {
      await this.triggerN8nWorkflow('test-completion', {
        testCycleId,
        coverage: coveragePercentage,
        passed: passedTests,
        failed: failedTests,
        critical: criticalFailures.length
      });
    }
  }

  // Trigger n8n workflow
  async triggerN8nWorkflow(workflowName, data) {
    try {
      await axios.post(
        `${process.env.N8N_BASE_URL}/webhook/${workflowName}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`🔄 n8n workflow '${workflowName}' triggered`);
    } catch (error) {
      console.error(`❌ Failed to trigger n8n workflow '${workflowName}':`, error.message);
    }
  }

  // Trigger coverage alert
  async triggerCoverageAlert(testCycleId, coverage) {
    console.log(`⚠️ Coverage alert: ${coverage}% below threshold for cycle ${testCycleId}`);
    
    // Trigger n8n alert workflow
    await this.triggerN8nWorkflow('coverage-alert', {
      testCycleId,
      coverage,
      threshold: 90,
      severity: coverage < 85 ? 'critical' : 'warning'
    });
  }

  // Handle critical failure response
  async triggerCriticalFailureResponse(testCycleId, criticalFailures) {
    console.log(`🚨 Critical failures detected in cycle ${testCycleId}:`, criticalFailures.length);
    
    // Trigger immediate response workflow
    await this.triggerN8nWorkflow('critical-failure-response', {
      testCycleId,
      failures: criticalFailures,
      severity: 'critical',
      requiresImmediate: true
    });
  }

  // Generate test report
  async generateReport(testCycleId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/projects/${this.projectId}/test-cycles/${testCycleId}/report`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
      throw error;
    }
  }

  // Health check for TestSprite integration
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/health`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 5000
        }
      );

      return {
        status: 'healthy',
        testsprite: response.data,
        integration: '53x21s-layer-53'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        integration: '53x21s-layer-53'
      };
    }
  }
}

module.exports = TestSpriteIntegration;