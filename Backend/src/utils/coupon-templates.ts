// utils/email/coupon-templates.ts
import { sendMail } from "./email";

// Base template with your brand styling
const baseEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - UGetMo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
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
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(rgba(21, 88, 116, 0.9), rgba(21, 88, 116, 0.8)), 
                        url('https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/files-1761205868288.jpeg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            padding: 50px 20px;
            text-align: center;
            color: white;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(21, 88, 116, 0.7);
            z-index: 1;
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo { 
            width: 280px;
            height: auto;
            margin: 0 auto 25px;
            display: block;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        .content {
            padding: 30px;
        }
        .coupon-box { 
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 3px dashed #ff9800;
            border-radius: 12px;
            padding: 30px;
            margin: 25px 0;
            text-align: center;
            position: relative;
        }
        .coupon-code { 
            font-size: 42px; 
            font-weight: bold; 
            color: #e65100;
            letter-spacing: 4px;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .discount-text { 
            font-size: 32px; 
            font-weight: bold; 
            color: #155874;
            margin: 15px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: #ff6b00; 
            color: white; 
            padding: 18px 50px; 
            text-decoration: none; 
            border-radius: 30px; 
            font-weight: bold;
            font-size: 18px;
            margin: 20px 0;
            text-transform: uppercase;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
        }
        .cta-button:hover {
            background: #e65100;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
        }
        .terms { 
            background: #f8f9fa; 
            padding: 25px; 
            margin: 25px 0;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
            border-left: 4px solid #155874;
        }
        .term-item {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .term-item:before {
            content: "✓";
            color: #155874;
            font-weight: bold;
            margin-right: 10px;
            background: #e3f2fd;
            padding: 2px 6px;
            border-radius: 50%;
            font-size: 12px;
        }
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }
        .product-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            transition: transform 0.3s ease;
        }
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .product-image {
            width: 120px;
            height: 120px;
            object-fit: contain;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        .product-name {
            font-weight: bold;
            margin-bottom: 5px;
            color: #155874;
        }
        .product-price {
            color: #ff6b00;
            font-weight: bold;
        }
        .category-badge {
            background: #155874;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin: 10px 5px;
            font-size: 14px;
        }
        .footer { 
            background: #2c3e50; 
            color: white; 
            padding: 30px; 
            text-align: center; 
            font-size: 12px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: white;
            margin: 0 15px;
            text-decoration: none;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .logo { width: 220px; }
            .coupon-code { font-size: 32px; }
            .discount-text { font-size: 24px; }
            .product-grid { grid-template-columns: 1fr; }
            .header { padding: 40px 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <img src="https://his-group-it-a3.s3.eu-north-1.amazonaws.com/leaves/1757624107140-files-1757624106950.png" 
                     alt="UGetMo Logo" 
                     class="logo"
                     style="display: block; width: 280px; height: auto;"/>
                <h1 style="margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${title}</h1>
            </div>
        </div>
        
        <div class="content">
            ${content}
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

// General Coupon Template (for everyone)
export const generalCouponTemplate = function (
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

  const content = `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>We're excited to offer you an exclusive discount to make your shopping experience even better!</p>
    
    <div class="coupon-box">
        <div class="discount-text">${discountText}</div>
        <div class="coupon-code">${couponCode}</div>
        <p style="color: #666; margin: 15px 0; font-size: 16px;">Use this code at checkout</p>
        <a href="https://www.ugetmogroup.com/client/shop/all" class="cta-button">Start Shopping Now</a>
    </div>

    <div class="terms">
        <h3 style="margin-top: 0; color: #155874; margin-bottom: 15px;">Terms & Conditions:</h3>
        ${terms.map(term => `<div class="term-item">${term}</div>`).join('')}
    </div>

    <p style="font-size: 16px; line-height: 1.8;">Don't miss out on this limited-time offer! Stock up on your favorite products and enjoy great savings.</p>
    <p style="font-size: 16px;">Happy shopping! 🛍️</p>
  `;

  return baseEmailTemplate(content, `Exclusive ${discountText} Offer Just For You!`);
};

// User-Specific Coupon Template
export const userSpecificCouponTemplate = function (
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
  terms.push(`Personal offer for ${userName}`);

  const content = `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>As one of our most valued customers, we wanted to give you something special!</p>
    
    <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #155874; font-weight: bold;">🎁 This exclusive offer is made just for you!</p>
    </div>

    <div class="coupon-box">
        <div style="background: #155874; color: white; padding: 10px; border-radius: 6px; margin: -30px -30px 20px -30px;">
            <p style="margin: 0; font-weight: bold;">PERSONAL OFFER</p>
        </div>
        <div class="discount-text">${discountText}</div>
        <div class="coupon-code">${couponCode}</div>
        <p style="color: #666; margin: 15px 0; font-size: 16px;">Your personal code for exclusive savings</p>
        <a href="https://www.ugetmogroup.com/client/shop/all" class="cta-button">Shop With Your Exclusive Offer</a>
    </div>

    <div class="terms">
        <h3 style="margin-top: 0; color: #155874; margin-bottom: 15px;">Your Personal Terms:</h3>
        ${terms.map(term => `<div class="term-item">${term}</div>`).join('')}
    </div>

    <p style="font-size: 16px; line-height: 1.8;">Thank you for being an amazing customer. We appreciate your loyalty!</p>
  `;

  return baseEmailTemplate(content, `Your Personal ${discountText} Exclusive Offer!`);
};

// Category-Specific Coupon Template
export const categoryCouponTemplate = function (
  userName: string,
  couponCode: string,
  discountValue: number,
  discountType: 'percentage' | 'fixed',
  validFrom: string,
  validTo: string,
  categories: string[],
  minimumCartAmount?: number,
  maximumDiscount?: number
) {
  const discountText = discountType === 'percentage' 
    ? `${discountValue}% OFF` 
    : `R${discountValue} OFF`;

  const categoryLinks = {
    'electronics': '/client/shop/electronics',
    'stationery': '/client/shop/stationery',
    'janitorial': '/client/shop/janitorial'
  };

  const terms = [];
  if (minimumCartAmount) {
    terms.push(`Minimum spend: R${minimumCartAmount}`);
  }
  if (maximumDiscount && discountType === 'percentage') {
    terms.push(`Maximum discount: R${maximumDiscount}`);
  }
  terms.push(`Valid on: ${categories.join(', ')}`);
  terms.push(`Valid until: ${new Date(validTo).toLocaleDateString()}`);

  const content = `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Great news! We have special discounts waiting for you in your favorite categories!</p>
    
    <div style="text-align: center; margin: 25px 0;">
        ${categories.map(category => 
          `<span class="category-badge">${category.charAt(0).toUpperCase() + category.slice(1)}</span>`
        ).join('')}
    </div>

    <div class="coupon-box">
        <div class="discount-text">${discountText}</div>
        <div class="coupon-code">${couponCode}</div>
        <p style="color: #666; margin: 15px 0; font-size: 16px;">Use on ${categories.join(', ')} products</p>
        
        <div style="margin: 20px 0;">
            ${categories.map(category => {
              const link = categoryLinks[category.toLowerCase()] || '/client/shop';
              return `<a href="https://www.ugetmogroup.com${link}" 
                        style="display: inline-block; background: #155874; color: white; padding: 10px 20px; 
                               margin: 5px; border-radius: 20px; text-decoration: none; font-size: 14px;">
                        Shop ${category}
                      </a>`;
            }).join('')}
        </div>
    </div>

    <div class="terms">
        <h3 style="margin-top: 0; color: #155874; margin-bottom: 15px;">Category Terms:</h3>
        ${terms.map(term => `<div class="term-item">${term}</div>`).join('')}
    </div>

    <p style="font-size: 16px; line-height: 1.8;">Perfect time to stock up on your ${categories.join(' and ')} essentials!</p>
  `;

  return baseEmailTemplate(content, `Special ${discountText} on ${categories.join(', ')}!`);
};

// Product-Specific Coupon Template
export const productCouponTemplate = function (
  userName: string,
  couponCode: string,
  discountValue: number,
  discountType: 'percentage' | 'fixed',
  validFrom: string,
  validTo: string,
  products: Array<{
    fullCode: string;
    productName: string;
    price: number;
    imageUrl: string;
  }>,
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
  terms.push(`Valid on selected products only`);
  terms.push(`Valid until: ${new Date(validTo).toLocaleDateString()}`);

  const content = `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>We have exciting discounts on products we think you'll love!</p>
    
    <div class="product-grid">
        ${products.map(product => `
          <div class="product-card">
            <img src="${product.imageUrl}" 
                 alt="${product.productName}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/120x120/155874/ffffff?text=UGetMo'">
            <div class="product-name">${product.productName}</div>
            <div class="product-price">R${product.price.toFixed(2)}</div>
            <a href="https://www.ugetmogroup.com/client/shop/${product.fullCode}" 
               style="display: inline-block; background: #155874; color: white; padding: 8px 16px; 
                      margin-top: 10px; border-radius: 4px; text-decoration: none; font-size: 12px;">
               View Product
            </a>
          </div>
        `).join('')}
    </div>

    <div class="coupon-box">
        <div class="discount-text">${discountText}</div>
        <div class="coupon-code">${couponCode}</div>
        <p style="color: #666; margin: 15px 0; font-size: 16px;">Apply to the products above</p>
        <a href="https://www.ugetmogroup.com/client/shop/all" class="cta-button">Shop These Products</a>
    </div>

    <div class="terms">
        <h3 style="margin-top: 0; color: #155874; margin-bottom: 15px;">Product Terms:</h3>
        ${terms.map(term => `<div class="term-item">${term}</div>`).join('')}
    </div>

    <p style="font-size: 16px; line-height: 1.8;">Don't miss these amazing deals on quality products!</p>
  `;

  return baseEmailTemplate(content, `Special ${discountText} on Selected Products!`);
};

// School-Specific Coupon Template
export const schoolCouponTemplate = function (
  userName: string,
  schoolName: string,
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
  terms.push(`Exclusive offer for ${schoolName}`);
  terms.push(`Valid until: ${new Date(validTo).toLocaleDateString()}`);

  const content = `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>As part of the <strong>${schoolName}</strong> community, you have access to exclusive educational discounts!</p>
    
    <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #2e7d32; font-weight: bold;">🏫 Special School Pricing for ${schoolName}</p>
    </div>

    <div class="coupon-box">
        <div style="background: #2e7d32; color: white; padding: 10px; border-radius: 6px; margin: -30px -30px 20px -30px;">
            <p style="margin: 0; font-weight: bold;">SCHOOL EXCLUSIVE</p>
        </div>
        <div class="discount-text">${discountText}</div>
        <div class="coupon-code">${couponCode}</div>
        <p style="color: #666; margin: 15px 0; font-size: 16px;">Your school's exclusive discount code</p>
        <a href="https://www.ugetmogroup.com/client/shop/schools" class="cta-button">Shop School Supplies</a>
    </div>

    <div style="margin: 25px 0;">
        <h3 style="color: #155874; margin-bottom: 15px;">Popular School Categories:</h3>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
            <a href="https://www.ugetmogroup.com/client/shop/stationery" 
               style="background: #155874; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none;">
               📝 Stationery
            </a>
        </div>
    </div>

    <div class="terms">
        <h3 style="margin-top: 0; color: #155874; margin-bottom: 15px;">School Terms:</h3>
        ${terms.map(term => `<div class="term-item">${term}</div>`).join('')}
    </div>

    <p style="font-size: 16px; line-height: 1.8;">Perfect for stocking up on classroom supplies, electronics, and maintenance items!</p>
  `;

  return baseEmailTemplate(content, `${schoolName} Exclusive ${discountText} Offer!`);
};