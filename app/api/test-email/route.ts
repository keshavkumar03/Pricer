// Create this file as: app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    const testEmailContent = {
      subject: 'Test Email from Price Tracker',
      body: `
        <div>
          <h2>Test Email</h2>
          <p>If you receive this email, your email configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };

    await sendEmail(testEmailContent, [email]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Failed to send test email: ${error}` 
    }, { status: 500 });
  }
}

// Test this endpoint by making a POST request to /api/test-email
// with body: { "email": "your-email@example.com" }