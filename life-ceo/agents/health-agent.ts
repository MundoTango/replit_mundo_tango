// Health Agent - Monitors health metrics and wellness
import { BaseAgent, AgentMessage, AgentTask } from './base-agent';
import OpenAI from 'openai';

export class HealthAgent extends BaseAgent {
  private openai: OpenAI;
  private healthData: {
    vitals: Map<string, any>;
    medications: Map<string, any>;
    appointments: Map<string, any>;
    symptoms: Map<string, any>;
  };

  constructor() {
    super({
      type: 'health',
      name: 'Health Agent',
      description: 'Monitors health metrics, manages medical appointments, and promotes wellness',
      permissions: ['health_data_access', 'appointment_scheduling', 'medication_reminders'],
      priority: 'high'
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.healthData = {
      vitals: new Map(),
      medications: new Map(),
      appointments: new Map(),
      symptoms: new Map()
    };
  }

  async processMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'request':
        await this.handleHealthRequest(message);
        break;
      case 'notification':
        await this.handleHealthNotification(message);
        break;
      case 'insight':
        await this.processHealthInsight(message);
        break;
      default:
        await this.storeMemory(message, 0.6, ['health', message.from]);
    }
  }

  private async handleHealthRequest(message: AgentMessage): Promise<void> {
    const { payload } = message;
    
    switch (payload.action) {
      case 'log_vitals':
        await this.logVitals(payload.data);
        break;
      case 'schedule_appointment':
        await this.scheduleAppointment(payload.data);
        break;
      case 'medication_reminder':
        await this.setMedicationReminder(payload.data);
        break;
      case 'track_symptom':
        await this.trackSymptom(payload.data);
        break;
      case 'wellness_check':
        await this.performWellnessCheck();
        break;
      default:
        await this.processWithAI(payload);
    }
  }

  private async logVitals(data: any): Promise<void> {
    const vitals = {
      id: this.generateId(),
      timestamp: new Date(),
      bloodPressure: data.bloodPressure,
      heartRate: data.heartRate,
      temperature: data.temperature,
      weight: data.weight,
      bloodSugar: data.bloodSugar,
      notes: data.notes
    };

    this.healthData.vitals.set(vitals.id, vitals);
    
    // Analyze vitals for anomalies
    const analysis = await this.analyzeVitals(vitals);
    
    if (analysis.hasAnomalies) {
      await this.createTask({
        title: 'Health Alert: Abnormal vitals detected',
        description: analysis.message,
        priority: 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
      
      // Notify emergency agent if critical
      if (analysis.severity === 'critical') {
        await this.sendMessage({
          to: 'emergency',
          type: 'notification',
          payload: { 
            event: 'critical_health_alert',
            data: { vitals, analysis }
          },
          priority: 'critical'
        });
      }
    }

    await this.storeMemory(vitals, 0.8, ['vitals', 'health_data']);
  }

  private async scheduleAppointment(data: any): Promise<void> {
    const appointment = {
      id: this.generateId(),
      type: data.type,
      doctor: data.doctor,
      location: data.location || 'Buenos Aires',
      dateTime: new Date(data.dateTime),
      reason: data.reason,
      notes: data.notes,
      reminders: data.reminders || [24, 2] // hours before
    };

    this.healthData.appointments.set(appointment.id, appointment);
    
    // Create reminder tasks
    for (const hoursBefor of appointment.reminders) {
      const reminderTime = new Date(appointment.dateTime.getTime() - hoursBefor * 60 * 60 * 1000);
      
      await this.createTask({
        title: `Appointment Reminder: ${appointment.type}`,
        description: `${appointment.doctor} at ${appointment.location}`,
        priority: 'medium',
        dueDate: reminderTime
      });
    }

    // Notify calendar/business agent
    await this.sendMessage({
      to: 'business',
      type: 'request',
      payload: {
        action: 'block_calendar',
        data: {
          title: `Medical: ${appointment.type}`,
          start: appointment.dateTime,
          duration: 60,
          location: appointment.location
        }
      },
      priority: 'high'
    });

    await this.storeMemory(appointment, 0.7, ['appointment', 'scheduled']);
  }

  private async setMedicationReminder(data: any): Promise<void> {
    const medication = {
      id: this.generateId(),
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      times: data.times || ['08:00', '20:00'],
      startDate: new Date(data.startDate || Date.now()),
      endDate: data.endDate ? new Date(data.endDate) : null,
      notes: data.notes
    };

    this.healthData.medications.set(medication.id, medication);
    
    // Create daily reminder tasks
    await this.createTask({
      title: `Medication: ${medication.name}`,
      description: `Take ${medication.dosage} at ${medication.times.join(', ')}`,
      priority: 'high',
      metadata: {
        recurring: true,
        recurrencePattern: 'daily'
      }
    });

    await this.storeMemory(medication, 0.8, ['medication', 'reminder']);
  }

  private async trackSymptom(data: any): Promise<void> {
    const symptom = {
      id: this.generateId(),
      type: data.type,
      severity: data.severity || 5, // 1-10 scale
      timestamp: new Date(),
      duration: data.duration,
      triggers: data.triggers || [],
      notes: data.notes
    };

    this.healthData.symptoms.set(symptom.id, symptom);
    
    // Analyze symptom patterns
    const pattern = await this.analyzeSymptomPatterns(symptom.type);
    
    if (pattern.isRecurring && pattern.frequency > 3) {
      await this.createTask({
        title: `Health Pattern Alert: Recurring ${symptom.type}`,
        description: `This symptom has occurred ${pattern.frequency} times in the last ${pattern.period}`,
        priority: 'medium'
      });
      
      // Suggest doctor visit if pattern is concerning
      if (pattern.averageSeverity > 7) {
        await this.generateInsight({
          type: 'health_recommendation',
          title: 'Consider Medical Consultation',
          content: `Recurring ${symptom.type} with high severity. Consider scheduling an appointment.`,
          confidence: 0.8,
          actionable: true
        });
      }
    }

    await this.storeMemory(symptom, 0.7, ['symptom', symptom.type]);
  }

  private async performWellnessCheck(): Promise<void> {
    // Comprehensive wellness analysis
    const vitalsHistory = Array.from(this.healthData.vitals.values());
    const recentVitals = vitalsHistory.filter(v => 
      new Date(v.timestamp).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const wellness: {
      physicalHealth: any;
      medicationAdherence: any;
      upcomingAppointments: any;
      recommendations: string[];
    } = {
      physicalHealth: await this.assessPhysicalHealth(recentVitals),
      medicationAdherence: await this.checkMedicationAdherence(),
      upcomingAppointments: await this.getUpcomingAppointments(),
      recommendations: []
    };

    // Buenos Aires specific recommendations
    const season = this.getBuenosAiresSeason();
    if (season === 'winter') {
      wellness.recommendations.push('Consider vitamin D supplementation during winter months');
      wellness.recommendations.push('Stay warm - Buenos Aires winters can be damp');
    }

    // Generate comprehensive wellness report
    await this.generateInsight({
      type: 'wellness_report',
      title: 'Monthly Wellness Check',
      content: JSON.stringify(wellness),
      confidence: 0.9,
      actionable: true
    });

    await this.storeMemory(wellness, 0.8, ['wellness', 'check']);
  }

  async generateInsights(): Promise<any[]> {
    const insights = [];
    
    // Medication adherence insights
    const adherence = await this.checkMedicationAdherence();
    if (adherence < 0.8) {
      insights.push({
        type: 'medication_adherence',
        title: 'Medication Reminder',
        content: `Your medication adherence is at ${(adherence * 100).toFixed(0)}%. Consistency is important for effectiveness.`,
        confidence: 0.9,
        actionable: true
      });
    }

    // Vitals trends
    const vitalsInsight = await this.analyzeVitalsTrends();
    if (vitalsInsight) {
      insights.push(vitalsInsight);
    }

    // Buenos Aires health tips
    const airQuality = await this.getBuenosAiresAirQuality();
    if (airQuality === 'poor') {
      insights.push({
        type: 'environmental_health',
        title: 'Air Quality Alert',
        content: 'Air quality in Buenos Aires is poor today. Consider limiting outdoor activities.',
        confidence: 0.7,
        actionable: true
      });
    }

    // Preventive care reminders
    const lastCheckup = await this.getLastCheckupDate();
    const monthsSinceCheckup = (Date.now() - lastCheckup.getTime()) / (30 * 24 * 60 * 60 * 1000);
    
    if (monthsSinceCheckup > 6) {
      insights.push({
        type: 'preventive_care',
        title: 'Health Checkup Due',
        content: `It's been ${Math.floor(monthsSinceCheckup)} months since your last checkup. Consider scheduling one.`,
        confidence: 0.8,
        actionable: true
      });
    }

    return insights;
  }

  async executeTask(task: AgentTask): Promise<void> {
    await this.updateTaskStatus(task.id, 'in_progress');

    try {
      if (task.title.includes('Medication')) {
        await this.executeMedicationReminder(task);
      } else if (task.title.includes('Appointment')) {
        await this.executeAppointmentReminder(task);
      } else if (task.title.includes('Health Alert')) {
        await this.executeHealthAlert(task);
      } else {
        await this.executeGenericHealthTask(task);
      }

      await this.updateTaskStatus(task.id, 'completed');
    } catch (error) {
      await this.updateTaskStatus(task.id, 'failed');
      throw error;
    }
  }

  // Helper methods
  private async analyzeVitals(vitals: any): Promise<any> {
    const anomalies = [];
    
    // Simple threshold checks (would be more sophisticated in production)
    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic > 140 || diastolic > 90) {
        anomalies.push('High blood pressure detected');
      }
    }
    
    if (vitals.heartRate && (vitals.heartRate < 60 || vitals.heartRate > 100)) {
      anomalies.push('Abnormal heart rate');
    }
    
    if (vitals.temperature && (vitals.temperature < 36 || vitals.temperature > 37.5)) {
      anomalies.push('Abnormal body temperature');
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      severity: anomalies.length > 2 ? 'critical' : anomalies.length > 0 ? 'warning' : 'normal',
      message: anomalies.join(', ')
    };
  }

  private async analyzeSymptomPatterns(symptomType: string): Promise<any> {
    const symptoms = Array.from(this.healthData.symptoms.values())
      .filter(s => s.type === symptomType);
    
    const recentSymptoms = symptoms.filter(s =>
      new Date(s.timestamp).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    const totalSeverity = recentSymptoms.reduce((sum, s) => sum + s.severity, 0);
    
    return {
      isRecurring: recentSymptoms.length > 1,
      frequency: recentSymptoms.length,
      period: '30 days',
      averageSeverity: recentSymptoms.length > 0 ? totalSeverity / recentSymptoms.length : 0
    };
  }

  private async assessPhysicalHealth(vitals: any[]): Promise<string> {
    if (vitals.length === 0) return 'insufficient_data';
    
    // Simple assessment based on vitals
    const latestVitals = vitals[vitals.length - 1];
    const analysis = await this.analyzeVitals(latestVitals);
    
    return analysis.severity;
  }

  private async checkMedicationAdherence(): Promise<number> {
    // Simplified adherence calculation
    // In production, would track actual medication taking events
    return 0.85; // 85% adherence
  }

  private async getUpcomingAppointments(): Promise<any[]> {
    const appointments = Array.from(this.healthData.appointments.values());
    const upcoming = appointments.filter(a =>
      a.dateTime.getTime() > Date.now()
    ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    
    return upcoming.slice(0, 3);
  }

  private getBuenosAiresSeason(): string {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) return 'winter';
    if (month >= 2 && month <= 4) return 'autumn';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }

  private async getBuenosAiresAirQuality(): Promise<string> {
    // Would integrate with air quality API
    return 'moderate';
  }

  private async getLastCheckupDate(): Promise<Date> {
    // Would query appointment history
    return new Date(Date.now() - 180 * 24 * 60 * 60 * 1000); // 6 months ago
  }

  private async analyzeVitalsTrends(): Promise<any | null> {
    const vitals = Array.from(this.healthData.vitals.values());
    if (vitals.length < 5) return null;

    // Simple trend analysis
    const weights = vitals.filter(v => v.weight).map(v => v.weight);
    if (weights.length > 3) {
      const trend = weights[weights.length - 1] - weights[0];
      if (Math.abs(trend) > 2) {
        return {
          type: 'weight_trend',
          title: 'Weight Change Detected',
          content: `Your weight has ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)}kg`,
          confidence: 0.7
        };
      }
    }

    return null;
  }

  private async processWithAI(payload: any): Promise<void> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: 'You are a health advisor helping someone manage their health in Buenos Aires, Argentina. Consider local healthcare system and health conditions.'
      }, {
        role: 'user',
        content: JSON.stringify(payload)
      }]
    });

    const result = response.choices[0].message.content;
    await this.storeMemory({ request: payload, response: result }, 0.6, ['ai_processed', 'health']);
  }

  private async executeMedicationReminder(task: AgentTask): Promise<void> {
    console.log(`Executing medication reminder: ${task.title}`);
  }

  private async executeAppointmentReminder(task: AgentTask): Promise<void> {
    console.log(`Executing appointment reminder: ${task.title}`);
  }

  private async executeHealthAlert(task: AgentTask): Promise<void> {
    console.log(`Executing health alert: ${task.title}`);
  }

  private async executeGenericHealthTask(task: AgentTask): Promise<void> {
    console.log(`Executing health task: ${task.title}`);
  }

  private async handleHealthNotification(message: AgentMessage): Promise<void> {
    await this.storeMemory(message.payload, 0.5, ['notification', message.from]);
  }

  private async processHealthInsight(message: AgentMessage): Promise<void> {
    await this.storeMemory(message.payload, 0.7, ['insight', message.from]);
  }

  private async generateInsight(insight: any): Promise<void> {
    // Store insight in database
    await this.storeMemory(insight, insight.confidence || 0.5, ['generated_insight']);
  }
}