import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from 'dotenv';
dotenv.config();

const ses = new SESClient({ region: process.env.AWS_REGION });

async function sendEmail() {
  const params = {
    Destination: {
      ToAddresses: ["kutlwano.ramotebele@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "Hello Kwanele! 🚀 This is a test email from exxarofund.com using AWS SES.",
        },
      },
      Subject: {
        Data: "Test Email from Exxarofund.com",
      },
    },
    Source: "noreply@exxarofund.com", // Must be a verified email or domain!
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await ses.send(command);
    console.log("Email sent successfully!", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

sendEmail();
