import fetch from 'node-fetch';
import crypto from 'crypto';

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzOWU1MzM0My1jNjFjLTQwNDgtYjk3Yy0xYjlhMmY5YWE3NTAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NTY3NTA5fQ.lM4vlCf-Wtk02zTCvJaIh3ioDco12-ui7P2lfrHwOGo';
const baseUrl = 'https://mundotango.app.n8n.cloud';

async function createWorkflows() {
  console.log('🚀 ESA: Creating Complete n8n Automation Workflows');
  console.log('================================================');
  console.log('');
  
  const workflows = [
    {
      name: 'User Registration to HubSpot',
      nodes: [
        {
          parameters: {
            path: 'user-registration',
            httpMethod: 'POST',
            responseMode: 'onReceived',
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1.1,
          position: [250, 300]
        },
        {
          parameters: {
            keepOnlySet: false,
            values: {
              string: [
                { name: 'email', value: '={{$json["body"]["email"]}}' },
                { name: 'firstName', value: '={{$json["body"]["firstName"]}}' },
                { name: 'lastName', value: '={{$json["body"]["lastName"]}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Format Data',
          type: 'n8n-nodes-base.set',
          typeVersion: 3.2,
          position: [450, 300]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://api.hubapi.com/contacts/v1/contact',
            sendHeaders: true,
            headerParameters: {
              parameters: [
                { name: 'Authorization', value: 'Bearer YOUR_HUBSPOT_KEY' },
                { name: 'Content-Type', value: 'application/json' }
              ]
            },
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: 'email', value: '={{$json["email"]}}' },
                { name: 'firstName', value: '={{$json["firstName"]}}' },
                { name: 'lastName', value: '={{$json["lastName"]}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Create Contact',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [650, 300]
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Format Data', type: 'main', index: 0 }]]
        },
        'Format Data': {
          main: [[{ node: 'Create Contact', type: 'main', index: 0 }]]
        }
      },
      settings: {
        saveDataSuccessExecution: 'all',
        saveExecutionProgress: true,
        saveManualExecutions: true
      },
      staticData: null,
      tags: []
    },
    {
      name: 'TestSprite Results Processor',
      nodes: [
        {
          parameters: {
            path: 'testsprite-results',
            httpMethod: 'POST',
            responseMode: 'onReceived',
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'TestSprite Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1.1,
          position: [250, 300]
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json["body"]["failed"]}}',
                  operation: 'larger',
                  value2: 0
                }
              ]
            }
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Check Failures',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [450, 300]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://mundotango.life/api/alerts',
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: 'testId', value: '={{$json["body"]["testId"]}}' },
                { name: 'failed', value: '={{$json["body"]["failed"]}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Send Alert',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [650, 250]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://mundotango.life/api/test-results',
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: 'data', value: '={{$json}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Store Results',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [650, 350]
        }
      ],
      connections: {
        'TestSprite Webhook': {
          main: [[{ node: 'Check Failures', type: 'main', index: 0 }]]
        },
        'Check Failures': {
          main: [
            [{ node: 'Send Alert', type: 'main', index: 0 }],
            [{ node: 'Store Results', type: 'main', index: 0 }]
          ]
        }
      },
      settings: {
        saveDataSuccessExecution: 'all',
        saveExecutionProgress: true,
        saveManualExecutions: true
      },
      staticData: null,
      tags: []
    },
    {
      name: 'Daily Analytics Report',
      nodes: [
        {
          parameters: {
            rule: {
              cronExpression: '0 9 * * *'
            }
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Daily Trigger',
          type: 'n8n-nodes-base.cron',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            method: 'GET',
            url: 'https://mundotango.life/api/analytics/daily',
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Get Analytics',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://mundotango.life/api/reports/email',
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: 'to', value: 'admin@mundotango.life' },
                { name: 'subject', value: 'Daily Analytics Report' },
                { name: 'data', value: '={{$json}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Email Report',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [650, 300]
        }
      ],
      connections: {
        'Daily Trigger': {
          main: [[{ node: 'Get Analytics', type: 'main', index: 0 }]]
        },
        'Get Analytics': {
          main: [[{ node: 'Email Report', type: 'main', index: 0 }]]
        }
      },
      settings: {
        saveDataSuccessExecution: 'all',
        saveExecutionProgress: true,
        saveManualExecutions: true,
        timezone: 'America/New_York'
      },
      staticData: null,
      tags: []
    },
    {
      name: 'Payment Processing (Stripe)',
      nodes: [
        {
          parameters: {
            path: 'stripe-webhook',
            httpMethod: 'POST',
            responseMode: 'onReceived',
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Stripe Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1.1,
          position: [250, 300]
        },
        {
          parameters: {
            rules: {
              values: [
                {
                  conditions: {
                    string: [
                      {
                        value1: '={{$json["body"]["type"]}}',
                        operation: 'equals',
                        value2: 'payment_intent.succeeded'
                      }
                    ]
                  },
                  outputKey: 'payment'
                },
                {
                  conditions: {
                    string: [
                      {
                        value1: '={{$json["body"]["type"]}}',
                        operation: 'equals',
                        value2: 'customer.subscription.created'
                      }
                    ]
                  },
                  outputKey: 'subscription'
                }
              ]
            },
            fallbackOutput: 'other'
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Route Event',
          type: 'n8n-nodes-base.switch',
          typeVersion: 3,
          position: [450, 300]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://mundotango.life/api/payments/process',
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: 'paymentData', value: '={{$json}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Process Payment',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [650, 250]
        },
        {
          parameters: {
            method: 'POST',
            url: 'https://mundotango.life/api/subscriptions/update',
            sendBody: true,
            bodyParameters: {
              parameters: [
                { name: 'subscriptionData', value: '={{$json}}' }
              ]
            },
            options: {}
          },
          id: crypto.randomBytes(8).toString('hex'),
          name: 'Update Subscription',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [650, 350]
        }
      ],
      connections: {
        'Stripe Webhook': {
          main: [[{ node: 'Route Event', type: 'main', index: 0 }]]
        },
        'Route Event': {
          main: [
            [{ node: 'Process Payment', type: 'main', index: 0 }],
            [{ node: 'Update Subscription', type: 'main', index: 0 }],
            []
          ]
        }
      },
      settings: {
        saveDataSuccessExecution: 'all',
        saveExecutionProgress: true,
        saveManualExecutions: true
      },
      staticData: null,
      tags: []
    }
  ];

  let successCount = 0;
  const createdWorkflows = [];

  for (const workflow of workflows) {
    try {
      console.log(`📦 Creating: ${workflow.name}`);
      
      const response = await fetch(`${baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(workflow)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SUCCESS! Created with ID: ${result.id}`);
        console.log(`   URL: https://mundotango.app.n8n.cloud/workflow/${result.id}`);
        createdWorkflows.push({
          name: workflow.name,
          id: result.id,
          url: `https://mundotango.app.n8n.cloud/workflow/${result.id}`
        });
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText.substring(0, 200)}`);
      }
      
      // Wait between creates
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('========================================');
  console.log(`🎉 RESULTS: Created ${successCount} of 4 workflows!`);
  console.log('========================================');
  
  if (successCount > 0) {
    console.log('');
    console.log('✅ Your new workflows:');
    createdWorkflows.forEach(w => {
      console.log(`   • ${w.name}`);
      console.log(`     ${w.url}`);
    });
    
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Refresh your n8n tab');
    console.log('2. Configure credentials');
    console.log('3. Test and activate');
  }
}

createWorkflows().catch(console.error);