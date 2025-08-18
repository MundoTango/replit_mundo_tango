// HubSpot CRM Integration
import axios from 'axios';

export class HubSpotService {
  private accessToken: string;
  private baseURL = 'https://api.hubapi.com';

  constructor() {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      throw new Error('HUBSPOT_ACCESS_TOKEN environment variable is required');
    }
    this.accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Get contacts
  async getContacts(limit = 10, archived = false) {
    try {
      const response = await axios.get(`${this.baseURL}/crm/v3/objects/contacts`, {
        headers: this.getHeaders(),
        params: { limit, archived }
      });
      return response.data;
    } catch (error) {
      console.error('HubSpot getContacts error:', error);
      throw error;
    }
  }

  // Create contact
  async createContact(contactData: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseURL}/crm/v3/objects/contacts`, {
        properties: contactData
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('HubSpot createContact error:', error);
      throw error;
    }
  }

  // Update contact
  async updateContact(contactId: string, updates: Record<string, any>) {
    try {
      const response = await axios.patch(`${this.baseURL}/crm/v3/objects/contacts/${contactId}`, {
        properties: updates
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('HubSpot updateContact error:', error);
      throw error;
    }
  }

  // Search contacts by email
  async searchContactByEmail(email: string) {
    try {
      const response = await axios.post(`${this.baseURL}/crm/v3/objects/contacts/search`, {
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }]
      }, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('HubSpot searchContactByEmail error:', error);
      throw error;
    }
  }
}

export const hubSpotService = new HubSpotService();