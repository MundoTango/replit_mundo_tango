# Life CEO Project Structure

## Overview
Life CEO is an AI-powered personal life management system designed for Scott Boddye. It operates completely independently from Mundo Tango and other community platforms, with API-based communication between systems.

## System Architecture

### 1. Database Layer (life-ceo/database/)
- **schema.sql**: Comprehensive PostgreSQL schema with:
  - User management (life_ceo.users)
  - 16 AI agent configurations (life_ceo.agents)
  - Vector-enabled memory storage (life_ceo.agent_memories)
  - Task management (life_ceo.tasks)
  - Inter-agent messaging (life_ceo.agent_messages)
  - Voice command history (life_ceo.voice_commands)
  - AI insights (life_ceo.insights)
  - Context awareness (life_ceo.user_context)
  - External integrations (life_ceo.integrations)

### 2. Agent System (life-ceo/agents/)
- **base-agent.ts**: Abstract base class providing:
  - Memory management with vector embeddings
  - Task creation and execution
  - Inter-agent messaging
  - Insight generation
  - Database operations

- **business-agent.ts**: Professional life management
  - Calendar integration
  - Meeting scheduling
  - Task prioritization
  - Network management

- **finance-agent.ts**: Financial planning
  - Budget monitoring (ARS/USD aware)
  - Investment tracking
  - Expense alerts
  - Buenos Aires inflation adjustments

- **health-agent.ts**: Wellness management
  - Vital signs monitoring
  - Medication reminders
  - Appointment scheduling
  - Buenos Aires seasonal health tips

### 3. Backend Server (life-ceo/server/)
- **index.ts**: Express server on port 4001
  - Voice command processing endpoint
  - Agent status monitoring
  - Task and insight retrieval
  - Life event integration

### 4. Mobile App (life-ceo/app/)
- **App.tsx**: Main app component with view navigation
- **components/MobileInterface.tsx**: Home screen with:
  - Agent status overview
  - Quick stats (urgent tasks, active agents, insights)
  - Voice command launcher
  - Task and insight navigation

- **components/VoiceInterface.tsx**: Voice interaction
  - Speech recognition (es-AR locale)
  - Speech synthesis
  - Real-time transcription
  - Visual feedback

- **components/TaskDashboard.tsx**: Task management
  - Priority-based filtering
  - Agent-specific task icons
  - Due date tracking
  - Status management

- **components/InsightFeed.tsx**: AI recommendations
  - Confidence scoring
  - Actionable insights
  - Type-based filtering
  - Time-based sorting

### 5. Integration Layer (integration/)
- **api-gateway/index.ts**: Central routing
  - System authentication
  - Request transformation
  - Health monitoring
  - Cross-system communication

## Key Features

### Mobile-First Design
- Optimized for Scott's primary mobile usage
- Voice command as primary interaction
- Buenos Aires Spanish (es-AR) support
- Touch-friendly interface

### AI Agent Ecosystem
- 16 specialized agents (currently 3 implemented)
- Autonomous task execution
- Inter-agent collaboration
- Context-aware decisions

### Data Independence
- Completely separate from Mundo Tango
- Own PostgreSQL database
- Vector storage for semantic search
- API-only communication

### Buenos Aires Optimization
- Local time zones
- Currency awareness (ARS/USD)
- Seasonal health recommendations
- Spanish language support

## Technology Stack
- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express
- **Database**: PostgreSQL with vector extensions
- **AI**: OpenAI GPT-4 integration
- **Voice**: Web Speech API
- **Architecture**: Microservices with API Gateway

## Development Status
✅ Database schema created
✅ API gateway implemented
✅ Base agent architecture
✅ 3 core agents implemented (Business, Finance, Health)
✅ Mobile app structure complete
✅ Voice interface ready
✅ Task management system
✅ Insight feed implemented

## Next Steps
- [ ] Implement remaining 13 agents
- [ ] Add authentication bridge
- [ ] Create unified dashboard
- [ ] Deploy to production
- [ ] Integrate with external services
- [ ] Add real-time sync
- [ ] Implement vector search