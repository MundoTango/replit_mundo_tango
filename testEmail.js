import fetch from 'node-fetch'

const API_KEY = process.env.RESEND_API_KEY

async function sendTestEmail() {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'scott@boddye.com',  // 👈 Updated email address
      subject: '🎉 Hello from Mundo Tango',
      html: `<strong>This is your first test email from the platform. Everything is working!</strong>`
    })
  })

  const data = await response.json()
  console.log('📬 Response:', data)
}

sendTestEmail()