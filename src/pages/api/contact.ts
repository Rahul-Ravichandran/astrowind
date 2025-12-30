import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.formData();
        const name = data.get('name')?.toString();
        const email = data.get('email')?.toString();
        const phone = data.get('phone')?.toString();
        const projectDetails = data.get('projectDetails')?.toString();
        const material = data.get('material')?.toString();
        const quantity = data.get('quantity')?.toString();
        const message = data.get('message')?.toString();

        // Validate required fields
        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ error: 'Name, email, and message are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Email configuration
        const recipientEmail = 'rahulr4121996@gmail.com';
        const subject = `New Quote Request from ${name}`;

        // Format email body
        const emailBody = `
New Quote Request from 3D Printing Website

Contact Information:
- Name: ${name}
- Email: ${email}
${phone ? `- Phone: ${phone}` : ''}

Project Details:
${projectDetails ? `- Project Type: ${projectDetails}` : ''}
${material ? `- Material: ${material}` : ''}
${quantity ? `- Quantity: ${quantity}` : ''}

Message:
${message}

---
This email was sent from the 3D Printing Services contact form.
    `.trim();

        // Send email using Resend API (or another email service)
        // To use Resend, add RESEND_API_KEY to your environment variables
        const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

        if (RESEND_API_KEY) {
            try {
                const resendResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: '3D Printing Service <noreply@yourdomain.com>',
                        to: recipientEmail,
                        subject: subject,
                        text: emailBody,
                        reply_to: email,
                    }),
                });

                if (!resendResponse.ok) {
                    const errorData = await resendResponse.json();
                    console.error('Resend API error:', errorData);
                    throw new Error('Failed to send email via Resend');
                }
            } catch (error) {
                console.error('Error sending email:', error);
                // Continue to return success even if email fails (you may want to log this)
            }
        } else {
            // If no API key, log the email (for development)
            console.log('=== EMAIL TO SEND ===');
            console.log('To:', recipientEmail);
            console.log('Subject:', subject);
            console.log('Body:', emailBody);
            console.log('===================');
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you for your inquiry! We will get back to you within 24-48 hours.',
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error processing form:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

