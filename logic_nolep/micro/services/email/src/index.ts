import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const QUEUE = 'email_notifications';

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection failed:', error);
    } else {
      console.log('SMTP server ready');
    }
  });

  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  console.log('Waiting for messages in queue:', QUEUE);

  channel.consume(QUEUE, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('Received message:', data);

      const mailOptions = {
        from: `"Nexarion Payments" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Payment Confirmation',
        text: `Hello ${data.name}, your payment of $${data.amount} was successful!\nPayment ID: ${data.paymentIntentId}`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to', data.email);
        channel.ack(msg);
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }
  });
}

main().catch(console.error);
