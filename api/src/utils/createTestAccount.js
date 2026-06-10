import nodemailer from 'nodemailer';

async function createTestAccount() {
  // Generate test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  console.log('Ethereal Email Credentials:');
  console.log('Email Username:', testAccount.user);
  console.log('Email Password:', testAccount.pass);
  console.log('SMTP Host:', testAccount.smtp.host);
  console.log('SMTP Port:', testAccount.smtp.port);
}

createTestAccount().catch(console.error); 