import nodemailer from "nodemailer";
 
// Configure Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "906482001@smtp-brevo.com",
    pass: "xfXGNJWjw2as5n0I",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
 
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  try {
    const mailOptions = {
      from: "developers@hisgroup-it.co.za",
      to: to,
      subject: subject,
      text: text,
      html: html,
    };
    console.log("Sending email to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}


// utils/email/coupon-templates.ts
export const newCouponAnnouncementTemplate = function (
  userName: string,
  couponCode: string,
  discountValue: number,
  discountType: 'percentage' | 'fixed',
  validFrom: string,
  validTo: string,
  minimumCartAmount?: number,
  maximumDiscount?: number
) {
  const discountText = discountType === 'percentage' 
    ? `${discountValue}% OFF` 
    : `R${discountValue} OFF`;

  const terms = [];
  if (minimumCartAmount) {
    terms.push(`Minimum spend: R${minimumCartAmount}`);
  }
  if (maximumDiscount && discountType === 'percentage') {
    terms.push(`Maximum discount: R${maximumDiscount}`);
  }
  terms.push(`Valid until: ${new Date(validTo).toLocaleDateString()}`);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Offer Just For You! - UGetMo</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f9f9f9; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
        }
        .header { 
            background: linear-gradient(135deg, #2c5aa0, #1e3d72);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .logo { 
            max-width: 150px; 
            margin: 0 auto 15px; 
        }
        .coupon-box { 
            background: #fff3e0; 
            border: 2px dashed #ff9800;
            border-radius: 12px;
            padding: 25px;
            margin: 25px;
            text-align: center;
        }
        .coupon-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #e65100;
            letter-spacing: 3px;
            margin: 15px 0;
        }
        .discount-text { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2c5aa0;
            margin: 10px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: #ff6b00; 
            color: white; 
            padding: 15px 40px; 
            text-decoration: none; 
            border-radius: 25px; 
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-transform: uppercase;
        }
        .terms { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 25px;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
        }
        .term-item {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .term-item:before {
            content: "•";
            color: #2c5aa0;
            font-weight: bold;
            margin-right: 10px;
        }
        .footer { 
            background: #2c3e50; 
            color: white; 
            padding: 25px; 
            text-align: center; 
            font-size: 12px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            color: white;
            margin: 0 10px;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGetMo Logo" class="logo"/>
            <h1>Special Offer Just For You!</h1>
            <p>Enjoy exclusive savings on your next purchase</p>
        </div>
        
        <div style="padding: 0 25px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We're excited to offer you an exclusive discount to make your shopping experience even better!</p>
        </div>

        <div class="coupon-box">
            <div class="discount-text">${discountText}</div>
            <div class="coupon-code">${couponCode}</div>
            <p style="color: #666; margin: 10px 0;">Use this code at checkout</p>
            <a href="https://www.ugetmogroup.com/" class="cta-button">Shop Now</a>
        </div>

        <div class="terms">
            <h3 style="margin-top: 0; color: #2c5aa0;">Terms & Conditions:</h3>
            ${terms.map(term => `<div class="term-item">${term}</div>`).join('')}
        </div>

        <div style="padding: 0 25px 25px;">
            <p>Don't miss out on this limited-time offer! Stock up on your favorite products and enjoy great savings.</p>
            <p>Happy shopping! 🛍️</p>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="#">Facebook</a> • 
                <a href="#">Instagram</a> • 
                <a href="#">Twitter</a>
            </div>
            <p>© ${new Date().getFullYear()} UGetMo Group. All rights reserved.</p>
            <p>You received this email because you're a valued UGetMo customer.</p>
            <p><a href="#" style="color: #ff6b00;">Unsubscribe</a> | <a href="#" style="color: #ff6b00;">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>
  `;
};

export const couponUpdateTemplate = function (
  userName: string,
  couponCode: string,
  discountValue: number,
  discountType: 'percentage' | 'fixed',
  validTo: string,
  whatsNew: string
) {
  const discountText = discountType === 'percentage' 
    ? `${discountValue}% OFF` 
    : `R${discountValue} OFF`;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Coupon Has Been Updated - UGetMo</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f9f9f9; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
        }
        .header { 
            background: linear-gradient(135deg, #27ae60, #219653);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .logo { 
            max-width: 150px; 
            margin: 0 auto 15px; 
        }
        .update-box { 
            background: #e8f5e8; 
            border-left: 4px solid #27ae60;
            padding: 20px;
            margin: 20px;
            border-radius: 4px;
        }
        .coupon-highlight { 
            background: #fff3e0; 
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
            text-align: center;
        }
        .coupon-code { 
            font-size: 28px; 
            font-weight: bold; 
            color: #e65100;
            letter-spacing: 2px;
            margin: 10px 0;
        }
        .discount-text { 
            font-size: 20px; 
            font-weight: bold; 
            color: #27ae60;
            margin: 10px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: #27ae60; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 20px; 
            font-weight: bold;
            margin: 15px 0;
        }
        .footer { 
            background: #2c3e50; 
            color: white; 
            padding: 25px; 
            text-align: center; 
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGetMo Logo" class="logo"/>
            <h1>Coupon Update!</h1>
            <p>Your discount has been improved</p>
        </div>
        
        <div style="padding: 0 25px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Great news! We've updated your coupon to give you even better value.</p>
        </div>

        <div class="update-box">
            <strong>What's New:</strong>
            <p>${whatsNew}</p>
        </div>

        <div class="coupon-highlight">
            <div class="discount-text">${discountText}</div>
            <div class="coupon-code">${couponCode}</div>
            <p style="color: #666; margin: 10px 0;">Valid until: ${new Date(validTo).toLocaleDateString()}</p>
            <a href="https://www.ugetmogroup.com/" class="cta-button">Use This Offer</a>
        </div>

        <div style="padding: 0 25px 25px;">
            <p>This is our way of thanking you for being a loyal customer. Enjoy your enhanced savings!</p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} UGetMo Group. All rights reserved.</p>
            <p>You received this email because you're a valued UGetMo customer.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export const adminCredentialsTemplate = function (
  fullName: string,
  email: string,
  password: string,
  loginUrl: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Account Created - UGetMo</title>
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f9f9f9; 
            margin: 0; 
            padding: 0; 
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
            text-align: center; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 25px;
        }
        .logo { 
            max-width: 180px; 
            margin: 0 auto 15px; 
        }
        .welcome-text { 
            font-size: 24px; 
            color: #2c5aa0; 
            margin-bottom: 10px;
            font-weight: bold;
        }
        .credentials-box { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 6px; 
            border-left: 4px solid #2c5aa0;
            margin: 25px 0; 
        }
        .credential-item { 
            margin-bottom: 12px; 
            padding: 8px 0;
        }
        .label { 
            font-weight: bold; 
            color: #555; 
            display: inline-block;
            width: 120px;
        }
        .value { 
            color: #222; 
            font-family: 'Courier New', monospace;
            background: #fff;
            padding: 4px 8px;
            border-radius: 3px;
            border: 1px solid #e1e5e9;
        }
        .password-warning { 
            background: #fff3cd; 
            color: #856404; 
            padding: 12px; 
            border-radius: 4px; 
            border: 1px solid #ffeaa7;
            margin: 15px 0;
            font-size: 14px;
        }
        .login-button { 
            display: inline-block; 
            background: #2c5aa0; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
            text-align: center;
        }
        .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 0.9em; 
            color: #666; 
            text-align: center; 
        }
        .security-note {
            background: #d1ecf1;
            color: #0c5460;
            padding: 12px;
            border-radius: 4px;
            border: 1px solid #bee5eb;
            margin: 15px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGetMo Logo" class="logo"/>
            <div class="welcome-text">Admin Account Created</div>
        </div>
        
        <p>Dear <strong>${fullName}</strong>,</p>
        
        <p>Your administrator account for UGetMo has been successfully created. Below are your login credentials:</p>
        
        <div class="credentials-box">
            <div class="credential-item">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
            </div>
            <div class="credential-item">
                <span class="label">Password:</span>
                <span class="value">${password}</span>
            </div>
            <div class="credential-item">
                <span class="label">Role:</span>
                <span class="value">Administrator</span>
            </div>
        </div>
        
        <div class="password-warning">
            ⚠️ <strong>Important:</strong> Please change your password immediately after first login for security reasons.
        </div>
        
        <div style="text-align: center;">
            <a href="${loginUrl}" class="login-button">Login to Admin Dashboard</a>
        </div>
        
        <div class="security-note">
            🔒 <strong>Security Notice:</strong> This password is automatically generated. Keep your credentials secure and do not share them with anyone.
        </div>
        
        <p>If you have any questions or need assistance, please contact the system administrator.</p>
        
        <div class="footer">
            <p>Best regards,<br><strong>UGetMo Administration Team</strong></p>
            <p>© ${new Date().getFullYear()} UGetMo Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export const resetPasswordTemplate = function (
  userName: string,
  email: string,
  otp: string
) {
  return `
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin:0; padding:0; }
        .container { max-width: 600px; margin: 20px auto; background:#fff; padding: 20px; box-shadow:0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; }
        .logo { max-width: 200px; margin: 0 auto; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; text-align:center; }
        .otp-box { background:#f0f7ff; padding:15px; text-align:center; border-radius:6px; font-size:20px; font-weight:bold; margin:20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGetMo Logo" class="logo"/>
        </div>
        
        <p>Dear ${userName},</p>
        <p>We received a request to reset the password for your UGetMo account.</p>
        
        <div class="otp-box">${otp}</div>
        
        <p>This OTP is valid for 10 minutes. Please use it promptly to complete your request.</p>
        
        <div class="footer">
            <p>Best regards,<br>UGetMo Team</p>
            <p>© ${new Date().getFullYear()} UGetMo Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

export const quoteEmailTemplate = function (
  name: string,
  email: string,
  subject: string,
  message: string
) {
  return `
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background:#f9f9f9; margin:0; padding:0; }
        .container { max-width: 600px; margin: 20px auto; background:#fff; padding: 20px; box-shadow:0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; }
        .logo { max-width: 200px; margin: 0 auto; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; text-align:center; }
        .quote-box { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .customer-info { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGetMo Logo" class="logo"/>
            <h2>Quote Request</h2>
        </div>
        
        <p>Dear ${name},</p>
        <p>Thank you for your interest in UGetMo services. We have received your quote request with the following details:</p>
        
        <div class="customer-info">
            <p><strong>Customer Information:</strong></p>
            <ul>
                <li>Name: ${name}</li>
                <li>Email: ${email}</li>
                <li>Subject: ${subject}</li>
            </ul>
        </div>
        
        <div class="quote-box">
            <p><strong>Your Request:</strong></p>
            <p>${message}</p>
        </div>
        
        <p>Our team will review your requirements and provide you with a detailed quote within 24-48 hours. If you have any urgent questions, please contact us.</p>
        
        <div class="footer">
            <p>For immediate assistance, contact <a href="mailto:sales@ugetmogroup.com" style="color:#004a8d;">sales@ugetmogroup.com</a></p>
            <p>© ${new Date().getFullYear()} UGetMo Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const otpEmailTemplate = function (
  recipientName: string,
  otpCode: string,
  companyName: string = "UGetMo",
  purpose: string = "Reset Password",
  expiryMinutes: number = 5
) {
  return `
   <html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background:#f9f9f9; margin:0; padding:0; }
        .container { max-width: 600px; margin: 20px auto; background:#fff; padding: 20px; box-shadow:0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; }
        .logo { max-width: 200px; margin: 0 auto; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; text-align:center; }
        .otp-box { background:#f0f7ff; padding:15px; text-align:center; border-radius:6px; font-size:20px; font-weight:bold; margin:20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGetMo Logo" class="logo"/>
            <h2>${companyName} Security Code</h2>
        </div>
        
        <p>Hello ${recipientName},</p>
        <p>Your verification code for ${purpose} is:</p>
        
        <div class="otp-box">${otpCode}</div>
        
        <p>This code is valid for ${expiryMinutes} minutes. Please do not share it with anyone.</p>
        
        <div class="footer">
            <p>If you did not request this, please contact our support immediately.</p>
            <p>© ${new Date().getFullYear()} ${companyName} Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};


// export const resetPasswordTemplate = function (
//   userName: string,
//   email: string,
//   otp: string
// ) {
//   return `
// <html>
// <head>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 20px auto; padding: 20px; }
//         .header { border-bottom: 2px solid #004a8d; padding-bottom: 10px; margin-bottom: 20px; }
//         .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h2>Kameso Total Hygeine</h2>
//         </div>
        
//         <p>Dear ${userName},</p>
//         <p>A password reset request has been received for your account.</p>
//         <p>Your OTP: <strong>${otp}</strong></p>
//         <p>This OTP is valid for 10 minutes.</p>
        
//         <div class="footer">
//             <p>Best regards,<br>Kameso Total Hygeine Team</p>
//         </div>
//     </div>
// </body>
// </html>

// `;
// };


// Add this to your existing utils/emails.ts file

export const orderStatusUpdateTemplate = function (
  userName: string,
  orderId: number,
  status: string,
  items: any[],
  total: number
) {
  const statusMessages: Record<string, string> = {
    "pending": "Your order has been received and is being processed.",
    "shipped": "Your order has been shipped and is on its way to you.",
    "completed": "Your order has been successfully delivered.",
    "cancelled": "Your order has been cancelled as requested."
  };

  const statusMessage = statusMessages[status.toLowerCase()] || "Your order status has been updated.";

  return `
<!DOCTYPE html>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        /* Preload the logo */
        body:before {
            content: '';
            display: none;
            background-image: url('https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png');
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            padding: 30px 20px;
            text-align: center;
            background-color: transparent !important;
        }
        .logo {
            max-width: 350px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .content {
            padding: 20px;
        }
        .order-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .status-update {
            background-color: #f0f7ff;
            padding: 15px;
            border-left: 4px solid #004a8d;
            margin: 20px 0;
        }
        .order-items {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .order-items th {
            background-color: #f5f5f5;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .order-items td {
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .product-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 10px;
        }
        .product-info {
            display: flex;
            align-items: center;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #004a8d;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
            font-weight: bold;
        }
        .divider {
            height: 1px;
            background-color: #eee;
            margin: 25px 0;
        }
        
        /* Fallback for email clients that don't support :before */
        .logo-fallback {
            display: none;
        }
    </style>
</head>
<body>
    <!-- Preload technique for email clients -->
    <div class="logo-fallback">
        <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" width="0" height="0" alt="" style="display:block;">
    </div>
    
    <div class="container">
        <div class="header" style="background-color: transparent;">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGETMO Logo" class="logo" width="350" style="max-width: 350px; height: auto;">
        </div>
        
        <div class="content">
            <h2>Order Status Update</h2>
            <p>Dear ${userName},</p>
            
            <div class="status-update">
                <h3>Status: ${status.toUpperCase()}</h3>
                <p>${statusMessage}</p>
            </div>
            
            <div class="order-info">
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Total Amount:</strong> R${total.toFixed(2)}</p>
            </div>
            
            <h3>Order Items:</h3>
            <table class="order-items">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div class="product-info">
                                    ${item.image ? `<img src="${item.image}" alt="${item.product?.productName || 'Product'}" class="product-image" width="60" height="60" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">` : ''}
                                    <div>${item.product?.productName || 'Unknown Product'}</div>
                                </div>
                            </td>
                            <td>${item.quantity}</td>
                            <td>R${item.price ? item.price.toFixed(2) : '0.00'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="divider"></div>
            
            <p>You can view your order details and track its progress by logging into your account.</p>
            <a href="https://www.ugetmogroup.com/client/profile/orders" class="button" style="display: inline-block; padding: 12px 24px; background-color: #004a8d; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: bold;">View Order Details</a>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team at <a href="mailto:sales@ugtmogroup.com" style="color: #004a8d;">sales@ugtmogroup.com</a></p>
            <p>© ${new Date().getFullYear()} UGETMO Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

export const softwareInquiryNotificationTemplate = (inquiry: any, type: 'admin' | 'client') => {
  if (type === 'admin') {
    return `
      <h2>New Software Inquiry Received</h2>
      <p><strong>Name:</strong> ${inquiry.name}</p>
      <p><strong>Email:</strong> ${inquiry.email}</p>
      <p><strong>Phone:</strong> ${inquiry.phone}</p>
      <p><strong>Company:</strong> ${inquiry.company}</p>
      <p><strong>Service Type:</strong> ${inquiry.serviceType}</p>
      <p><strong>Project Details:</strong></p>
      <p>${inquiry.projectDetails}</p>
      <p><em>Submitted at: ${new Date(inquiry.submittedAt).toLocaleString()}</em></p>
    `;
  } else {
    return `
      <h2>Thank You for Your Software Inquiry</h2>
      <p>Dear ${inquiry.name},</p>
      <p>Thank you for reaching out to UGetMo regarding your ${inquiry.serviceType} project. We have received your inquiry and will review it carefully.</p>
      <p>Our team will get back to you within 24-48 hours to discuss your project requirements in more detail.</p>
      <p><strong>Summary of your inquiry:</strong></p>
      <ul>
        <li><strong>Service:</strong> ${inquiry.serviceType}</li>
        <li><strong>Company:</strong> ${inquiry.company}</li>
      </ul>
      <p>Best regards,<br/>The UGetMo Team</p>
    `;
  }
};

// utils/email.ts - Add this function
export const welcomeNewsletterTemplate = (): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to UGetMo Newsletter</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .welcome-text { font-size: 18px; margin-bottom: 20px; }
            .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .benefit-item { margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .unsubscribe { color: #999; font-size: 12px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to UGetMo!</h1>
                <p>You're now part of our exclusive community</p>
            </div>
            <div class="content">
                <div class="welcome-text">
                    <p>Hello valued customer,</p>
                    <p>Thank you for subscribing to the UGetMo newsletter! We're excited to have you on board.</p>
                </div>
                
                <div class="benefits">
                    <h3>Here's what you can look forward to:</h3>
                    <div class="benefit-item">✅ <strong>Exclusive Deals:</strong> Be the first to know about special promotions</div>
                    <div class="benefit-item">✅ <strong>New Arrivals:</strong> Get updates on latest products</div>
                    <div class="benefit-item">✅ <strong>Educational Content:</strong> Tips and guides for your school needs</div>
                    <div class="benefit-item">✅ <strong>Early Access:</strong> Priority access to sales and new features</div>
                </div>

                <p>We promise to only send you valuable content and won't spam your inbox.</p>
                
                <div class="footer">
                    <p>Happy shopping!<br>The UGetMo Team</p>
                    <div class="unsubscribe">
                        <p>If you wish to unsubscribe at any time, simply click the unsubscribe link in our emails.</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Mockup Added Email Template
export const mockupAddedTemplate = function (
  userName: string,
  orderId: number,
  productName: string,
  adminNotes: string,
  mockupUrl: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Mockup Added to Your Order</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            padding: 30px 20px;
            text-align: center;
            background-color: transparent !important;
        }
        .logo {
            max-width: 350px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .content {
            padding: 20px;
        }
        .order-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .mockup-update {
            background-color: #f0f7ff;
            padding: 20px;
            border-left: 4px solid #004a8d;
            margin: 20px 0;
        }
        .mockup-preview {
            text-align: center;
            margin: 20px 0;
        }
        .mockup-image {
            max-width: 100%;
            height: auto;
            max-height: 300px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .notes-section {
            background-color: #fff8e6;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #ffc107;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #004a8d;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
            font-weight: bold;
        }
        .divider {
            height: 1px;
            background-color: #eee;
            margin: 25px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="background-color: transparent;">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGETMO Logo" class="logo" width="350" style="max-width: 350px; height: auto;">
        </div>
        
        <div class="content">
            <h2>New Mockup Added to Your Order</h2>
            <p>Dear ${userName},</p>
            
            <div class="mockup-update">
                <h3>New Design Mockup Ready for Review</h3>
                <p>Our design team has added a new mockup for your product. Please review it and provide your feedback.</p>
            </div>
            
            <div class="order-info">
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Product:</strong> ${productName}</p>
            </div>

            ${adminNotes ? `
            <div class="notes-section">
                <h4>Designer's Notes:</h4>
                <p>${adminNotes}</p>
            </div>
            ` : ''}
            
            <div class="mockup-preview">
                <h4>Mockup Preview:</h4>
                <img src="${mockupUrl}" alt="Design Mockup" class="mockup-image" style="max-width: 100%; height: auto; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            </div>
            
            <div class="divider"></div>
            
            <p>Please review this mockup and provide your approval or feedback. You can view all mockups and communicate with our design team through your order page.</p>
            
            <a href="https://www.ugetmogroup.com/client/profile/orders" class="button" style="display: inline-block; padding: 12px 24px; background-color: #004a8d; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: bold;">Review Mockup & Provide Feedback</a>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                Need to request changes? Click the button above to access your order and send feedback to our design team.
            </p>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team at <a href="mailto:sales@ugtmogroup.com" style="color: #004a8d;">sales@ugtmogroup.com</a></p>
            <p>© ${new Date().getFullYear()} UGETMO Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};


// Branding Status Update Email Template
export const brandingStatusUpdateTemplate = function (
  userName: string,
  orderId: number,
  productName: string,
  status: string,
  customerNotes: string,
  isApproved: boolean
) {
  const statusMessages: Record<string, string> = {
    "approved": "has been approved successfully!",
    "rejected": "has been rejected.",
    "revision_requested": "requires revisions based on your feedback.",
    "pending": "is pending your review."
  };

  const statusMessage = statusMessages[status.toLowerCase()] || "status has been updated.";
  const statusColor = isApproved ? "#28a745" : "#dc3545";

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Branding Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            padding: 30px 20px;
            text-align: center;
            background-color: transparent !important;
        }
        .logo {
            max-width: 350px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .content {
            padding: 20px;
        }
        .order-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .status-update {
            background-color: ${isApproved ? '#d4edda' : '#f8d7da'};
            padding: 20px;
            border-left: 4px solid ${statusColor};
            margin: 20px 0;
            color: ${isApproved ? '#155724' : '#721c24'};
        }
        .customer-notes {
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #17a2b8;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #004a8d;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
            font-weight: bold;
        }
        .divider {
            height: 1px;
            background-color: #eee;
            margin: 25px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="background-color: transparent;">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGETMO Logo" class="logo" width="350" style="max-width: 350px; height: auto;">
        </div>
        
        <div class="content">
            <h2>Branding Status Update</h2>
            <p>Dear ${userName},</p>
            
            <div class="status-update">
                <h3 style="color: ${statusColor}; margin-top: 0;">Status: ${status.toUpperCase()}</h3>
                <p>Your branding design for <strong>${productName}</strong> ${statusMessage}</p>
            </div>
            
            <div class="order-info">
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Product:</strong> ${productName}</p>
            </div>

            ${customerNotes ? `
            <div class="customer-notes">
                <h4>Your Feedback:</h4>
                <p>${customerNotes}</p>
            </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <p>${isApproved ? 
                'Your design has been approved and will proceed to production. Thank you for your feedback!' : 
                'Our design team will review your feedback and create updated mockups for your review.'
            }</p>
            
            <a href="https://www.ugetmogroup.com/client/profile/orders" class="button" style="display: inline-block; padding: 12px 24px; background-color: #004a8d; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; font-weight: bold;">View Order Details</a>
            
            ${!isApproved ? `
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                Our design team will contact you soon with updated mockups based on your feedback.
            </p>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team at <a href="mailto:sales@ugtmogroup.com" style="color: #004a8d;">sales@ugtmogroup.com</a></p>
            <p>© ${new Date().getFullYear()} UGETMO Group. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

export const welcomeEmployeeTemplate = function (
  employeeName: string,
  companyName: string,
  resetLink: string,
  supportEmail: string = "support@company.com",
  expiryHours: number = 72
) {
  return `
  <html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; }
        .header { border-bottom: 2px solid #004a8d; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Welcome to Kameso Total Hygeine</h2>
        </div>
        
        <p>Dear ${employeeName},</p>
        <p>Welcome to Kameso Total Hygeine! Please set up your account using the link below:</p>
        <p><a href="${resetLink}">Create Password</a></p>
        <p>This link expires in ${expiryHours} hours.</p>
        
        <div class="footer">
            <p>For assistance, contact ${supportEmail}</p>
            <p>© ${new Date().getFullYear()} Kameso Total Hygeine</p>
        </div>
    </div>
</body>
</html>
    `;
};

// export const otpEmailTemplate = function (
//   recipientName: string,
//   otpCode: string,
//   companyName: string,
//   purpose: string = "Reset Password",
//   expiryMinutes: number = 5
// ) {
//   return `
//    <html>
// <head>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 20px auto; padding: 20px; }
//         .header { border-bottom: 2px solid #004a8d; padding-bottom: 10px; margin-bottom: 20px; }
//         .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h2>Kameso Total Hygeine Security Code</h2>
//         </div>
        
//         <p>Hello ${recipientName},</p>
//         <p>Your verification code for ${purpose}:</p>
//         <h3>${otpCode}</h3>
//         <p>Valid for ${expiryMinutes} minutes</p>
        
//         <div class="footer">
//             <p>Do not share this code. Contact support if you didn't request this.</p>
//             <p>© ${new Date().getFullYear()} Kameso Total Hygeine</p>
//         </div>
//     </div>
// </body>
// </html>
//     `;


    
// };

// export const quoteEmailTemplate = function (
//   name: string,
//   email: string,
//   subject: string,
//   message: string
// ) {
//   return `
// <html>
// <head>
//     <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 20px auto; padding: 20px; }
//         .header { border-bottom: 2px solid #004a8d; padding-bottom: 10px; margin-bottom: 20px; }
//         .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #666; }
//         .quote-box { background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
//         .customer-info { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 15px 0; }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h2>Petro Global Connect - Quote Request</h2>
//         </div>
        
//         <p>Dear ${name} </p>
        
//         <p>Thank you for your interest in Petro Global Connect services. We have received your quote request with the following details:</p>
        
//         <div class="customer-info">
//             <p><strong>Customer Information:</strong></p>
//             <ul>
//                 <li>Name: ${name}</li>
//                 <li>Email: ${email}</li>
//                 <li>Subject: ${subject}</li>
//             </ul>
//         </div>
        
//         <div class="quote-box">
//             <p><strong>Your Request:</strong></p>
//             <p>${message}</p>
//         </div>
        
//         <p>Our team will review your requirements and provide you with a detailed quote within 24-48 hours. If you have any urgent questions, please don't hesitate to contact us.</p>
        
//         <div class="footer">
//             <p>For immediate assistance, contact support@petrogloba-connect.co.za or call 078 773 736</p>
//             <p>© ${new Date().getFullYear()} Petro Global Connect. All rights reserved.</p>
//         </div>
//     </div>
// </body>
// </html>
//     `;
// };

// utils/emails/templates/orderConfirmation.ts

export const orderConfirmationTemplate = (
  customerName: string,
  orderId: string,
  orderDate: string,
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  totalAmount: number,
  shippingAddress: string,
  viewOrdersLink: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - UGETMO</title>
    <link rel="preload" as="image" href="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 30px 0;
        }
        .logo {
            max-width: 250px;
            height: auto;
        }
        .content {
            padding: 30px 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 15px;
            border-bottom: 2px solid #29367C;
            padding-bottom: 5px;
        }
        .order-summary {
            width: 100%;
            border-collapse: collapse;
        }
        .order-summary th {
            text-align: left;
            padding: 12px;
            background-color: #f9f9f9;
            border-bottom: 1px solid #eeeeee;
        }
        .order-summary td {
            padding: 12px;
            border-bottom: 1px solid #eeeeee;
        }
        .product-image {
            width: 60px;
            height: 60px;
            object-fit: contain;
            background-color: #f9f9f9;
            border: 1px solid #eeeeee;
        }
        .total-row {
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #29367C;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }
        .footer {
            padding: 20px 30px;
            background-color: #f9f9f9;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
        .address-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #eeeeee;
        }
        .thank-you {
            font-size: 16px;
            margin-bottom: 20px;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGETMO" class="logo">
        </div>
        
        <div class="content">
            <div class="thank-you">
                <strong>Dear ${customerName},</strong>
                <p>Thank you for your purchase! Your order has been confirmed and will be processed shortly.</p>
            </div>
            
            <div class="section">
                <div class="section-title">Order Information</div>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
            </div>
            
            <div class="section">
                <div class="section-title">Order Summary</div>
                <table class="order-summary" width="100%">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center;">
                                        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="product-image" style="margin-right: 10px;">` : ''}
                                        <div>${item.name}</div>
                                    </div>
                                </td>
                                <td>${item.quantity}</td>
                                <td>R${item.price.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="2" style="text-align: right;">Total:</td>
                            <td>R${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Shipping Address</div>
                <div class="address-box">
                    ${shippingAddress}
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${viewOrdersLink}" class="button">View Your Orders</a>
            </div>
            
            <div style="margin-top: 30px;">
                <p>If you have any questions about your order, please contact our customer service team.</p>
                <p>Thank you for shopping with UGETMO Group!</p>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UGETMO. All rights reserved.</p>
            <p>UGETMO Group | Building Brands, Creating Experiences</p>
        </div>
    </div>
</body>
</html>
`;
};

// utils/emails/templates/adminOrderNotification.ts
export const adminOrderNotificationTemplate = (
  customerName: string,
  customerEmail: string,
  orderId: string,
  orderDate: string,
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  totalAmount: number,
  shippingAddress: string,
  orderDetailsLink: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification - UGETMO</title>
    <link rel="preload" as="image" href="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 30px 0;
        }
        .logo {
            max-width: 250px;
            height: auto;
        }
        .content {
            padding: 30px 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 15px;
            border-bottom: 2px solid #29367C;
            padding-bottom: 5px;
        }
        .alert-banner {
            background-color: #29367C;
            color: white;
            padding: 15px;
            text-align: center;
            margin-bottom: 25px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: bold;
        }
        .order-summary {
            width: 100%;
            border-collapse: collapse;
        }
        .order-summary th {
            text-align: left;
            padding: 12px;
            background-color: #f9f9f9;
            border-bottom: 1px solid #eeeeee;
        }
        .order-summary td {
            padding: 12px;
            border-bottom: 1px solid #eeeeee;
            vertical-align: middle;
        }
        .product-image {
            width: 60px;
            height: 60px;
            object-fit: contain;
            background-color: #f9f9f9;
            border: 1px solid #eeeeee;
            margin-right: 10px;
            border-radius: 4px;
        }
        .total-row {
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #29367C;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }
        .footer {
            padding: 20px 30px;
            background-color: #f9f9f9;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
        .address-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #eeeeee;
        }
        .customer-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
        }
        .info-box {
            flex: 1;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #eeeeee;
            margin-right: 10px;
        }
        .info-box:last-child {
            margin-right: 0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 15px;
            }
            .customer-info {
                flex-direction: column;
            }
            .info-box {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" alt="UGETMO" class="logo">
        </div>
        
        <div class="content">
            <div class="alert-banner">
                🚨 New Order Received!
            </div>
            
            <div class="customer-info">
                <div class="info-box">
                    <strong>Customer:</strong><br>
                    ${customerName}<br>
                    ${customerEmail}
                </div>
                <div class="info-box">
                    <strong>Order Information:</strong><br>
                    Order #: ${orderId}<br>
                    Date: ${orderDate}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Order Summary</div>
                <table class="order-summary" width="100%">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center;">
                                        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="product-image">` : ''}
                                        <span>${item.name}</span>
                                    </div>
                                </td>
                                <td>${item.quantity}</td>
                                <td>R${item.price.toFixed(2)}</td>
                                <td>R${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total Amount:</td>
                            <td>R${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Shipping Address</div>
                <div class="address-box">
                    ${shippingAddress}
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${orderDetailsLink}" class="button">View Order Details</a>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UGETMO. All rights reserved.</p>
            <p>UGETMO Group Admin System</p>
        </div>
    </div>
</body>
</html>
`;
};


// Export all templates
export * from './coupon-templates';
