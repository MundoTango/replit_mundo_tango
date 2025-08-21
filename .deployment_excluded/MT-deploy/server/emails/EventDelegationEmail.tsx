import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface EventDelegationEmailProps {
  userName: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  role: string;
  inviterName: string;
  acceptUrl: string;
}

export const EventDelegationEmail: React.FC<EventDelegationEmailProps> = ({
  userName,
  eventTitle,
  eventDescription,
  eventLocation,
  role,
  inviterName,
  acceptUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to manage {eventTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Event Admin Invitation</Heading>
          </Section>
          
          <Section style={content}>
            <Text style={text}>
              ¡Hola {userName}!
            </Text>
            
            <Text style={text}>
              <strong>{inviterName}</strong> has invited you to be a <strong>{role}</strong> for the following event:
            </Text>
            
            <Section style={eventCard}>
              <Heading as="h2" style={h2}>
                {eventTitle}
              </Heading>
              
              <Text style={eventDescription}>
                {eventDescription}
              </Text>
              
              <Text style={locationText}>
                <strong>📍 Location:</strong> {eventLocation}
              </Text>
            </Section>
            
            <Section style={roleSection}>
              <Heading as="h3" style={h3}>
                Your Responsibilities as {role}:
              </Heading>
              
              {role === 'admin' ? (
                <ul style={list}>
                  <li>Edit event details and settings</li>
                  <li>Moderate event page content</li>
                  <li>Send notifications to attendees</li>
                  <li>Manage RSVPs and guest list</li>
                </ul>
              ) : (
                <ul style={list}>
                  <li>Moderate event page posts and comments</li>
                  <li>Remove inappropriate content</li>
                  <li>Help maintain a positive event atmosphere</li>
                </ul>
              )}
            </Section>
            
            <Section style={buttonContainer}>
              <Button style={button} href={acceptUrl}>
                Accept Invitation
              </Button>
            </Section>
            
            <Text style={smallText}>
              If you don't want to accept this invitation, you can simply ignore this email.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              Mundo Tango - Connecting the Global Tango Community
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%)',
  padding: '40px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '40px',
  backgroundColor: '#ffffff',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 10px',
};

const eventCard = {
  backgroundColor: '#f0fdfa',
  border: '1px solid #5eead4',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const h2 = {
  color: '#38b2ac',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const eventDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 10px',
};

const locationText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const roleSection = {
  margin: '30px 0',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 15px',
};

const list = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  paddingLeft: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '30px',
};

const button = {
  background: 'linear-gradient(135deg, #38b2ac 0%, #06b6d4 100%)',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '14px 28px',
  margin: '0 auto',
};

const smallText = {
  color: '#9ca3af',
  fontSize: '14px',
  textAlign: 'center' as const,
  marginTop: '20px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '40px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
};

export default EventDelegationEmail;