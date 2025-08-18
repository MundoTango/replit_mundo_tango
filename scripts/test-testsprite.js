#!/usr/bin/env node

/**
 * TestSprite Integration Test Script
 * Tests the real TestSprite API connection
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://18b562b7-65d8-4db8-8480-61e8ab9b1db1-00-145w1q6sp1kov.kirk.replit.dev';

async function testTestSpriteIntegration() {
  console.log('🧪 Testing TestSprite Integration...\n');
  
  // Check if API key exists
  if (!process.env.TESTSPRITE_API_KEY) {
    console.error('❌ TESTSPRITE_API_KEY not found in environment');
    return;
  }
  
  console.log('✅ TestSprite API Key found:', process.env.TESTSPRITE_API_KEY.substring(0, 10) + '...');
  
  // Test 1: Verify TestSprite API connection
  console.log('\n📡 Testing TestSprite API Connection...');
  try {
    const response = await fetch('https://api.testsprite.com/v1/status', {
      headers: {
        'Authorization': `Bearer ${process.env.TESTSPRITE_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ TestSprite API Connected:', data);
    } else {
      console.log('⚠️ TestSprite API returned:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ TestSprite API connection failed:', error.message);
  }
  
  // Test 2: Verify webhook endpoint
  console.log('\n🔔 Testing Webhook Endpoint...');
  try {
    const webhookTest = {
      event_type: 'test_completed',
      test_id: 'test_manual_' + Date.now(),
      status: 'passed',
      timestamp: new Date().toISOString(),
      test_suite: 'manual-test',
      results: {
        passed: 10,
        failed: 0,
        skipped: 1,
        duration: '5 minutes'
      }
    };
    
    const response = await fetch(`${BASE_URL}/api/testsprite/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookTest)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook endpoint working:', data);
    } else {
      console.log('❌ Webhook failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Webhook test failed:', error.message);
  }
  
  console.log('\n✨ TestSprite Integration Test Complete!');
  console.log('Next steps:');
  console.log('1. Go to Admin Center > TestSprite tab');
  console.log('2. Click "Trigger Tests" to start real tests');
  console.log('3. Monitor results in the dashboard');
}

testTestSpriteIntegration().catch(console.error);