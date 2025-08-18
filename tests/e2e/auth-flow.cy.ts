describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.task('cleanDatabase');
    cy.task('seedDatabase');
  });

  it('should complete user registration flow', () => {
    cy.visit('/');
    
    // Should redirect to login if not authenticated
    cy.url().should('include', '/auth/login');
    
    // Navigate to registration
    cy.contains('Sign up').click();
    cy.url().should('include', '/auth/register');
    
    // Fill registration form
    cy.get('[data-cy=username-input]').type('newuser');
    cy.get('[data-cy=email-input]').type('newuser@example.com');
    cy.get('[data-cy=password-input]').type('securepassword123');
    cy.get('[data-cy=first-name-input]').type('New');
    cy.get('[data-cy=last-name-input]').type('User');
    
    // Submit registration
    cy.get('[data-cy=register-button]').click();
    
    // Should proceed to onboarding
    cy.url().should('include', '/onboarding');
    cy.contains('Welcome to Mundo Tango').should('be.visible');
  });

  it('should complete onboarding process', () => {
    cy.visit('/onboarding');
    
    // Step 1: Basic Information
    cy.get('[data-cy=bio-input]').type('Passionate tango dancer from Buenos Aires');
    
    // Select tango roles
    cy.get('[data-cy=role-dancer]').click();
    cy.get('[data-cy=role-traveler]').click();
    
    // Dancing experience
    cy.get('[data-cy=experience-intermediate]').click();
    cy.get('[data-cy=years-dancing]').type('5');
    
    // Location selection with Google Maps
    cy.get('[data-cy=location-input]').type('Buenos Aires');
    cy.get('[data-cy=location-suggestion]').first().click();
    
    cy.get('[data-cy=continue-button]').click();
    
    // Step 2: Code of Conduct
    cy.url().should('include', '/code-of-conduct');
    cy.contains('Community Guidelines').should('be.visible');
    
    cy.get('[data-cy=accept-checkbox]').check();
    cy.get('[data-cy=complete-registration]').click();
    
    // Should redirect to main app
    cy.url().should('include', '/moments');
    cy.contains('Share your tango moment').should('be.visible');
  });

  it('should handle login with existing user', () => {
    cy.visit('/auth/login');
    
    cy.get('[data-cy=email-input]').type('admin@mundotango.life');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    
    // Should redirect to main app
    cy.url().should('include', '/moments');
    cy.contains('Scott Boddye').should('be.visible');
  });

  it('should handle logout process', () => {
    // Login first
    cy.visit('/auth/login');
    cy.get('[data-cy=email-input]').type('admin@mundotango.life');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    
    // Navigate to profile menu
    cy.get('[data-cy=profile-menu]').click();
    cy.get('[data-cy=logout-button]').click();
    
    // Should redirect to login
    cy.url().should('include', '/auth/login');
    cy.contains('Welcome back').should('be.visible');
  });

  it('should validate form inputs', () => {
    cy.visit('/auth/register');
    
    // Try to submit empty form
    cy.get('[data-cy=register-button]').click();
    
    // Should show validation errors
    cy.contains('Username is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Invalid email format
    cy.get('[data-cy=email-input]').type('invalid-email');
    cy.get('[data-cy=register-button]').click();
    cy.contains('Invalid email format').should('be.visible');
    
    // Short password
    cy.get('[data-cy=password-input]').type('123');
    cy.get('[data-cy=register-button]').click();
    cy.contains('Password must be at least 8 characters').should('be.visible');
  });
});