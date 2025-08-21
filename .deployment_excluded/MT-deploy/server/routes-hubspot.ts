// HubSpot CRM Integration Routes
import { Router } from 'express';
import { hubSpotService } from './hubspot';
import { isAuthenticated } from './replitAuth';

const router = Router();

// Test HubSpot connection
router.get('/api/hubspot/test', isAuthenticated, async (req, res) => {
  try {
    const contacts = await hubSpotService.getContacts(2);
    res.json({ 
      success: true, 
      message: 'HubSpot connection successful',
      sampleContacts: contacts.results 
    });
  } catch (error) {
    console.error('HubSpot test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'HubSpot connection failed' 
    });
  }
});

// Get all contacts
router.get('/api/hubspot/contacts', isAuthenticated, async (req, res) => {
  try {
    const { limit = 20, archived = false } = req.query;
    const contacts = await hubSpotService.getContacts(Number(limit), Boolean(archived));
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create contact from user registration
router.post('/api/hubspot/contacts', isAuthenticated, async (req, res) => {
  try {
    const { email, firstname, lastname, phone, company } = req.body;
    
    // Check if contact already exists
    const existingContact = await hubSpotService.searchContactByEmail(email);
    
    if (existingContact.results.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Contact already exists',
        contact: existingContact.results[0] 
      });
    }
    
    const contact = await hubSpotService.createContact({
      email,
      firstname,
      lastname,
      phone,
      company
    });
    
    res.json({ 
      success: true, 
      message: 'Contact created successfully',
      contact 
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.patch('/api/hubspot/contacts/:contactId', isAuthenticated, async (req, res) => {
  try {
    const { contactId } = req.params;
    const updates = req.body;
    
    const contact = await hubSpotService.updateContact(contactId, updates);
    res.json({ 
      success: true, 
      message: 'Contact updated successfully',
      contact 
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Search contact by email
router.get('/api/hubspot/contacts/search/:email', isAuthenticated, async (req, res) => {
  try {
    const { email } = req.params;
    const results = await hubSpotService.searchContactByEmail(email);
    res.json(results);
  } catch (error) {
    console.error('Search contact error:', error);
    res.status(500).json({ error: 'Failed to search contact' });
  }
});

export default router;