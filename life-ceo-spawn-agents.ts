// Life CEO Platform - Agent Spawn Script
// This script initializes all sub-agents in the system

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Agent definitions
const agents = [
  {
    name: 'mundo_tango_ceo',
    type: 'project_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/mundo-tango-ceo/prompt.md',
    config: {
      project_id: 'mundo_tango',
      supabase_instance: 'mundo-tango-prod',
      role_types: ['dancer', 'dj', 'teacher', 'organizer', 'performer']
    }
  },
  {
    name: 'finance_ceo',
    type: 'financial_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/finance-ceo/prompt.md',
    config: {
      integrations: ['stripe', 'lemon_squeezy'],
      budget_alerts: true,
      reporting_schedule: 'daily'
    }
  },
  {
    name: 'travel_ceo',
    type: 'travel_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/travel-ceo/prompt.md',
    config: {
      integrations: ['booking', 'airbnb', 'google_maps'],
      visa_tracking: true,
      budget_sync: true
    }
  },
  {
    name: 'modeling_agent',
    type: 'content_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/modeling-agent/prompt.md',
    config: {
      portfolio_platforms: ['lovable.dev', 'instagram'],
      calendar_sync: true
    }
  },
  {
    name: 'citizenship_visa_agent',
    type: 'legal_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/citizenship-visa-agent/prompt.md',
    config: {
      focus_region: 'EU',
      document_tracking: true,
      deadline_alerts: true
    }
  },
  {
    name: 'security_agent',
    type: 'security_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/security-agent/prompt.md',
    config: {
      scan_frequency: 'hourly',
      enforce_rbac: true,
      audit_all: true
    }
  },
  {
    name: 'social_media_agent',
    type: 'content_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/social-media-agent/prompt.md',
    config: {
      platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
      auto_post: false,
      privacy_aware: true
    }
  },
  {
    name: 'memory_agent',
    type: 'memory_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/memory-agent/prompt.md',
    config: {
      index_sources: ['chatgpt', 'notion', 'supabase', 'voice'],
      retention_days: 365,
      emotion_tracking: true
    }
  },
  {
    name: 'voice_environment_agent',
    type: 'voice_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/voice-environment-agent/prompt.md',
    config: {
      transcription_api: 'whisper',
      emotion_detection: true,
      noise_filtering: true
    }
  },
  {
    name: 'legal_ethics_agent',
    type: 'legal_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/legal-ethics-agent/prompt.md',
    config: {
      compliance_frameworks: ['gdpr', 'ccpa'],
      consent_tracking: true,
      ip_management: true
    }
  },
  {
    name: 'workflow_automation_agent',
    type: 'automation_manager',
    parent_name: 'life_ceo',
    prompt_file: 'agents/workflow-automation-agent/prompt.md',
    config: {
      automation_platforms: ['n8n', 'make'],
      webhook_management: true,
      scheduled_jobs: true
    }
  }
];

// Permissions for each agent type
const agentPermissions = {
  'project_manager': [
    { resource: 'projects', actions: ['create', 'read', 'update'] },
    { resource: 'memory', actions: ['read', 'write'] },
    { resource: 'delegation', actions: ['create', 'accept'] }
  ],
  'financial_manager': [
    { resource: 'financial_data', actions: ['read', 'write'] },
    { resource: 'budgets', actions: ['create', 'update'] },
    { resource: 'transactions', actions: ['read', 'categorize'] }
  ],
  'travel_manager': [
    { resource: 'travel_plans', actions: ['create', 'read', 'update'] },
    { resource: 'bookings', actions: ['create', 'modify'] },
    { resource: 'location_data', actions: ['read', 'update'] }
  ],
  'content_manager': [
    { resource: 'content', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'media', actions: ['upload', 'manage'] },
    { resource: 'scheduling', actions: ['create', 'update'] }
  ],
  'legal_manager': [
    { resource: 'documents', actions: ['read', 'store'] },
    { resource: 'compliance', actions: ['monitor', 'report'] },
    { resource: 'consent', actions: ['track', 'manage'] }
  ],
  'security_manager': [
    { resource: '*', actions: ['audit'] },
    { resource: 'permissions', actions: ['read', 'enforce'] },
    { resource: 'vulnerabilities', actions: ['scan', 'report'] }
  ],
  'memory_manager': [
    { resource: 'memory', actions: ['read', 'write', 'index'] },
    { resource: 'embeddings', actions: ['create', 'search'] },
    { resource: 'tags', actions: ['create', 'manage'] }
  ],
  'voice_manager': [
    { resource: 'audio', actions: ['process', 'transcribe'] },
    { resource: 'environment', actions: ['monitor', 'analyze'] },
    { resource: 'emotions', actions: ['detect', 'log'] }
  ],
  'automation_manager': [
    { resource: 'workflows', actions: ['create', 'execute', 'monitor'] },
    { resource: 'webhooks', actions: ['create', 'manage'] },
    { resource: 'schedules', actions: ['create', 'update'] }
  ]
};

async function spawnAgents() {
  console.log('🚀 Starting Life CEO Agent Spawn Process...\n');

  try {
    // Get Life CEO agent ID
    const { data: lifeCeo, error: lifeCeoError } = await supabase
      .from('agents')
      .select('id')
      .eq('name', 'life_ceo')
      .single();

    if (lifeCeoError || !lifeCeo) {
      throw new Error('Life CEO agent not found. Please run database initialization first.');
    }

    console.log('✅ Found Life CEO agent:', lifeCeo.id);

    // Spawn each sub-agent
    for (const agentDef of agents) {
      console.log(`\n📤 Spawning ${agentDef.name}...`);

      // Load prompt template (in real implementation)
      const promptTemplate = `You are ${agentDef.name}, a specialized agent in the Life CEO system...`;

      // Insert agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: agentDef.name,
          type: agentDef.type,
          parent_id: lifeCeo.id,
          prompt_template: promptTemplate,
          config: agentDef.config,
          status: 'initializing'
        })
        .select()
        .single();

      if (agentError) {
        console.error(`❌ Failed to spawn ${agentDef.name}:`, agentError);
        continue;
      }

      console.log(`✅ Spawned ${agentDef.name} with ID: ${agent.id}`);

      // Assign permissions
      const permissions = agentPermissions[agentDef.type as keyof typeof agentPermissions] || [];
      
      for (const perm of permissions) {
        const { error: permError } = await supabase
          .from('agent_permissions')
          .insert({
            agent_id: agent.id,
            resource: perm.resource,
            actions: perm.actions
          });

        if (permError) {
          console.error(`❌ Failed to assign permission for ${perm.resource}:`, permError);
        }
      }

      console.log(`✅ Assigned ${permissions.length} permissions to ${agentDef.name}`);

      // Log the spawn event
      await supabase.rpc('log_agent_activity', {
        p_agent_id: lifeCeo.id,
        p_action_type: 'spawn',
        p_action_name: 'agent_spawned',
        p_output: { spawned_agent_id: agent.id, agent_name: agentDef.name }
      });

      // Update agent status to active
      await supabase
        .from('agents')
        .update({ status: 'active' })
        .eq('id', agent.id);
    }

    console.log('\n🎉 All agents spawned successfully!');
    console.log('\n📊 Agent Hierarchy:');
    
    // Display hierarchy
    const { data: allAgents } = await supabase
      .from('agents')
      .select('name, type, status')
      .order('created_at');

    console.log('\nLife CEO (orchestrator) - active');
    allAgents?.forEach(agent => {
      if (agent.name !== 'life_ceo') {
        console.log(`  └── ${agent.name} (${agent.type}) - ${agent.status}`);
      }
    });

    // Log startup completion
    await supabase.rpc('log_agent_activity', {
      p_agent_id: lifeCeo.id,
      p_action_type: 'startup',
      p_action_name: 'life_ceo_activated',
      p_output: { 
        total_agents_spawned: agents.length,
        timestamp: new Date().toISOString()
      }
    });

    console.log('\n✅ Life CEO system fully initialized and ready!');

  } catch (error) {
    console.error('❌ Error spawning agents:', error);
    process.exit(1);
  }
}

// Run the spawn process
spawnAgents().then(() => {
  console.log('\n👋 Agent spawn process complete. Exiting...');
  process.exit(0);
});