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

interface EventReminderEmailProps {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  eventType: string;
  eventUrl: string;
}

export const EventReminderEmail: React.FC<EventReminderEmailProps> = ({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventDescription,
  eventType,
  eventUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reminder: {eventTitle} is tomorrow!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Event Reminder</Heading>
          </Section>
          
          <Section style={content}>
            <Heading as="h2" style={h2}>
              {eventTitle}
            </Heading>
            
            <Text style={text}>
              ¡Hola {userName}!
            </Text>
            
            <Text style={text}>
              This is a friendly reminder about your upcoming event tomorrow.
            </Text>
            
            <Section style={eventDetails}>
              <Text style={detailRow}>
                <strong>📅 Date:</strong> {eventDate}
              </Text>
              <Text style={detailRow}>
                <strong>🕐 Time:</strong> {eventTime}
              </Text>
              <Text style={detailRow}>
                <strong>📍 Location:</strong> {eventLocation}
              </Text>
              <Text style={detailRow}>
                <strong>💃 Type:</strong> {eventType}
              </Text>
            </Section>
            
            <Text style={text}>
              {eventDescription}
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={eventUrl}>
                View Event Details
              </Button>
            </Section>
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
  padding: '30px',
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

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 10px',
};

const eventDetails = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const detailRow = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '5px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '30px',
};

const button = {
  backgroundColor: '#38b2ac',
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

const footer = {
  textAlign: 'center' as const,
  marginTop: '40px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
};

export default EventReminderEmail;