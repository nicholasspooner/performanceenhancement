require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname)));

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many enquiry attempts. Please try again later.' }
});

function clean(value, maxLength = 2000) {
  return String(value || '').trim().slice(0, maxLength);
}

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return process.env[name];
}

const transporter = nodemailer.createTransport({
  host: requireEnv('SMTP_HOST'),
  port: Number(requireEnv('SMTP_PORT')),
  secure: String(process.env.SMTP_SECURE || 'true') === 'true',
  auth: {
    user: requireEnv('SMTP_USER'),
    pass: requireEnv('SMTP_PASS')
  }
});

app.post('/send-enquiry', enquiryLimiter, async (req, res) => {
  try {
    const name = clean(req.body.name, 200);
    const email = clean(req.body.email, 300);
    const role = clean(req.body.role, 300);
    const focus = clean(req.body.focus, 300);
    const message = clean(req.body.message, 4000);

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const to = process.env.ENQUIRY_TO || 'nicholasspooner@gmail.com';
    const from = process.env.ENQUIRY_FROM || process.env.SMTP_USER;

    const text = [
      'New website enquiry',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Role / context: ${role || 'Not supplied'}`,
      `Primary focus: ${focus || 'Not supplied'}`,
      '',
      'Message:',
      message
    ].join('\n');

    const html = `
      <h2>New website enquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Role / context:</strong> ${role || 'Not supplied'}</p>
      <p><strong>Primary focus:</strong> ${focus || 'Not supplied'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `Website enquiry from ${name}`,
      text,
      html
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Enquiry send failed:', error);
    res.status(500).json({ error: 'The enquiry could not be sent.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Website running at http://localhost:${port}`);
});
