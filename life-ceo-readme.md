# Life CEO Platform

## 🧠 Overview

Life CEO is an AI-powered life management system that orchestrates multiple specialized agents to handle different aspects of Scott Boddye's life. Built with a hierarchical agent architecture, it serves as the parent infrastructure above all other life projects.

## 🏗️ Architecture

### Agent Hierarchy
```
Life CEO (Master Orchestrator)
├── Mundo Tango CEO - Global tango platform management
├── Finance CEO - Budget, investments, and financial tracking
├── Travel CEO - Nomadic logistics and travel coordination
├── Modeling Agent - Portfolio and career management
├── Citizenship/Visa Agent - Immigration and legal residency
├── Security Agent - System security and access control
├── Social Media Agent - Online presence management
├── Memory Agent - Central knowledge repository
├── Voice & Environment Agent - Audio processing and context
├── Legal & Ethics Agent - Compliance and ethical oversight
└── Workflow/Automation Agent - Task automation and integration
```

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Voice**: Whisper API
- **Automation**: N8N / Make.com
- **Deployment**: Replit
- **Version Control**: GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Supabase account
- OpenAI API key
- Replit account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/scottboddye/life-ceo-platform.git
cd life-ceo-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Initialize the database:
```bash
npm run db:init
```

5. Start the development server:
```bash
npm run dev
```

## 📋 Daily Operation

The Life CEO system operates on a daily review cycle:

1. **10:00 AM Local Time**: Daily review initiates
2. **Memory Scan**: Loads context from all sources
3. **Agent Status**: Checks health of all sub-agents
4. **Task Prioritization**: Reviews and prioritizes tasks
5. **Mode Detection**: Adjusts tone based on user state (Builder/Social/Vibe)

## 🔒 Security

- **RBAC/ABAC**: Role and attribute-based access control
- **RLS**: Row-level security in Supabase
- **Encryption**: All sensitive data encrypted at rest
- **Audit Trail**: Complete logging of all agent actions

## 📝 Configuration

Each agent has its own configuration in `/agents/[agent-name]/config.json`:

```json
{
  "name": "agent_name",
  "type": "agent_type",
  "permissions": ["read", "write", "delegate"],
  "schedule": {
    "daily_report": "09:00"
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific agent tests
npm test -- --agent=finance_ceo

# Run integration tests
npm run test:integration
```

## 📊 Monitoring

- **Health Dashboard**: `/dashboard`
- **Agent Logs**: Stored in `agent_logs` table
- **Performance Metrics**: Real-time monitoring via Supabase
- **Error Tracking**: Automated alerts for failures

## 🤝 Contributing

This is a personal project for Scott Boddye. External contributions are not currently accepted.

## 📄 License

Private repository - All rights reserved.

## 🔗 Related Projects

- [Mundo Tango](https://github.com/scottboddye/mundo-tango) - Global tango platform
- Individual agent repositories (private)

## 📞 Support

For issues or questions, contact via the Life CEO chat interface.

---

*Life CEO - Your AI-powered life operating system*