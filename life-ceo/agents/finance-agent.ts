// Finance Agent - Manages financial planning and transactions
import { BaseAgent, AgentMessage, AgentTask } from './base-agent';
import OpenAI from 'openai';

export class FinanceAgent extends BaseAgent {
  private openai: OpenAI;
  private financeContext: {
    accounts: Map<string, any>;
    transactions: Map<string, any>;
    budgets: Map<string, any>;
    investments: Map<string, any>;
  };

  constructor() {
    super({
      type: 'finance',
      name: 'Finance Agent',
      description: 'Handles financial planning, budgeting, and investment tracking',
      permissions: ['bank_access', 'investment_access', 'expense_tracking'],
      priority: 'high'
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.financeContext = {
      accounts: new Map(),
      transactions: new Map(),
      budgets: new Map(),
      investments: new Map()
    };
  }

  async processMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'request':
        await this.handleRequest(message);
        break;
      case 'notification':
        await this.handleNotification(message);
        break;
      default:
        await this.storeMemory(message, 0.5, ['message', message.from]);
    }
  }

  private async handleRequest(message: AgentMessage): Promise<void> {
    const { payload } = message;
    
    switch (payload.action) {
      case 'analyze_spending':
        await this.analyzeSpending(payload.data);
        break;
      case 'create_budget':
        await this.createBudget(payload.data);
        break;
      case 'investment_update':
        await this.updateInvestments(payload.data);
        break;
      case 'expense_alert':
        await this.handleExpenseAlert(payload.data);
        break;
      default:
        await this.processWithAI(payload);
    }
  }

  private async analyzeSpending(data: any): Promise<void> {
    // Analyze spending patterns
    const transactions = Array.from(this.financeContext.transactions.values());
    const recentTransactions = transactions.filter(t => 
      new Date(t.date).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const analysis = {
      totalSpent: recentTransactions.reduce((sum, t) => sum + (t.amount < 0 ? -t.amount : 0), 0),
      categories: this.categorizeTransactions(recentTransactions),
      trends: await this.analyzeTrends(recentTransactions),
      recommendations: []
    };

    // Generate insights
    if (analysis.totalSpent > data.monthlyLimit * 0.8) {
      analysis.recommendations.push('You\'re approaching your monthly spending limit');
      
      await this.createTask({
        title: 'Review and reduce expenses',
        description: `Monthly spending at ${Math.round(analysis.totalSpent / data.monthlyLimit * 100)}% of limit`,
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      });
    }

    await this.storeMemory(analysis, 0.8, ['spending', 'analysis']);
    
    // Notify relevant agents
    await this.sendMessage({
      to: 'workflow',
      type: 'notification',
      payload: { event: 'spending_analysis', data: analysis },
      priority: 'medium'
    });
  }

  private async createBudget(data: any): Promise<void> {
    const budget = {
      id: this.generateId(),
      name: data.name,
      amount: data.amount,
      period: data.period || 'monthly',
      categories: data.categories || {},
      startDate: new Date(data.startDate || Date.now()),
      alerts: data.alerts || { warning: 0.8, critical: 0.95 }
    };

    this.financeContext.budgets.set(budget.id, budget);
    
    // Create monitoring task
    await this.createTask({
      title: `Monitor budget: ${budget.name}`,
      description: `Track spending against ${budget.amount} ARS budget`,
      priority: 'medium'
    });

    await this.storeMemory(budget, 0.7, ['budget', 'created']);
  }

  private async updateInvestments(data: any): Promise<void> {
    // Buenos Aires specific: Consider USD/ARS exchange rate
    const exchangeRate = await this.getExchangeRate();
    
    const investment = {
      id: data.id || this.generateId(),
      type: data.type,
      amount: data.amount,
      currency: data.currency || 'ARS',
      valueInARS: data.currency === 'USD' ? data.amount * exchangeRate : data.amount,
      date: new Date(),
      performance: data.performance || 0
    };

    this.financeContext.investments.set(investment.id, investment);
    
    // Analyze portfolio
    const portfolio = Array.from(this.financeContext.investments.values());
    const totalValue = portfolio.reduce((sum, inv) => sum + inv.valueInARS, 0);
    
    await this.storeMemory(
      { investment, portfolio: { totalValue, count: portfolio.length } },
      0.7,
      ['investment', 'portfolio']
    );
  }

  private async handleExpenseAlert(data: any): Promise<void> {
    // Critical expense alert
    await this.createTask({
      title: `Urgent: Review expense - ${data.description}`,
      description: `Unusual expense detected: ${data.amount} ARS`,
      priority: 'critical',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Notify emergency agent if needed
    if (data.amount > 10000) {
      await this.sendMessage({
        to: 'emergency',
        type: 'notification',
        payload: { event: 'large_expense', data },
        priority: 'high'
      });
    }
  }

  async generateInsights(): Promise<any[]> {
    const insights = [];
    
    // Budget insights
    const budgets = Array.from(this.financeContext.budgets.values());
    for (const budget of budgets) {
      const spending = await this.calculateBudgetSpending(budget);
      const percentage = (spending / budget.amount) * 100;
      
      if (percentage > budget.alerts.warning * 100) {
        insights.push({
          type: 'warning',
          title: `${budget.name} Budget Alert`,
          content: `You've used ${percentage.toFixed(1)}% of your budget`,
          confidence: 0.9,
          actionable: true
        });
      }
    }

    // Argentina-specific insights
    const inflationRate = 0.04; // 4% monthly inflation estimate
    insights.push({
      type: 'inflation',
      title: 'Inflation Adjustment Reminder',
      content: `Consider adjusting your budgets for ${(inflationRate * 100).toFixed(1)}% monthly inflation`,
      confidence: 0.8,
      actionable: true
    });

    // Investment insights
    const investments = Array.from(this.financeContext.investments.values());
    if (investments.length > 0) {
      const totalPerformance = investments.reduce((sum, inv) => sum + inv.performance, 0) / investments.length;
      
      insights.push({
        type: 'investment',
        title: 'Portfolio Performance',
        content: `Average portfolio return: ${totalPerformance.toFixed(2)}%`,
        confidence: 0.7
      });
    }

    return insights;
  }

  async executeTask(task: AgentTask): Promise<void> {
    await this.updateTaskStatus(task.id, 'in_progress');

    try {
      if (task.title.includes('budget')) {
        await this.monitorBudget(task);
      } else if (task.title.includes('expense')) {
        await this.reviewExpense(task);
      } else if (task.title.includes('investment')) {
        await this.checkInvestments(task);
      } else {
        await this.executeGenericTask(task);
      }

      await this.updateTaskStatus(task.id, 'completed');
    } catch (error) {
      await this.updateTaskStatus(task.id, 'failed');
      throw error;
    }
  }

  // Helper methods
  private categorizeTransactions(transactions: any[]): Record<string, number> {
    const categories = {};
    
    for (const transaction of transactions) {
      const category = transaction.category || 'Other';
      categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
    }
    
    return categories;
  }

  private async analyzeTrends(transactions: any[]): Promise<any> {
    // Simple trend analysis
    const dailySpending = {};
    
    for (const transaction of transactions) {
      const date = new Date(transaction.date).toDateString();
      dailySpending[date] = (dailySpending[date] || 0) + Math.abs(transaction.amount);
    }
    
    const values = Object.values(dailySpending);
    const average = values.reduce((sum: number, val: any) => sum + val, 0) / values.length;
    
    return {
      averageDailySpending: average,
      trend: values[values.length - 1] > average ? 'increasing' : 'decreasing'
    };
  }

  private async getExchangeRate(): Promise<number> {
    // In production, would fetch from API
    // Using approximate rate for Buenos Aires blue dollar
    return 1000;
  }

  private async calculateBudgetSpending(budget: any): Promise<number> {
    const transactions = Array.from(this.financeContext.transactions.values());
    const budgetTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= budget.startDate && 
             (budget.categories[t.category] || budget.categories['all']);
    });
    
    return budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  private async processWithAI(payload: any): Promise<void> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: 'You are a financial advisor helping someone manage their finances in Buenos Aires, Argentina. Consider local economic conditions and currency considerations.'
      }, {
        role: 'user',
        content: JSON.stringify(payload)
      }]
    });

    const result = response.choices[0].message.content;
    await this.storeMemory({ request: payload, response: result }, 0.6, ['ai_processed', 'finance']);
  }

  private async monitorBudget(task: AgentTask): Promise<void> {
    console.log(`Monitoring budget: ${task.title}`);
  }

  private async reviewExpense(task: AgentTask): Promise<void> {
    console.log(`Reviewing expense: ${task.title}`);
  }

  private async checkInvestments(task: AgentTask): Promise<void> {
    console.log(`Checking investments: ${task.title}`);
  }

  private async executeGenericTask(task: AgentTask): Promise<void> {
    console.log(`Executing finance task: ${task.title}`);
  }

  private async handleNotification(message: AgentMessage): Promise<void> {
    await this.storeMemory(message.payload, 0.4, ['notification', message.from]);
  }
}