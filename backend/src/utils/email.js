const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER || "ruturajvidhate5656@gmail.com",
        pass: process.env.SMTP_PASS || "fwke zazb wtgw aiwa"
    }
});

const sendOTP = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.SMTP_USER || "ruturajvidhate5656@gmail.com",
        to: email,
        subject: "Login OTP Verification - Car Rental Service",
        html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`
    });
};

const sendBookingNotificationToVendor = async (vendorEmail, details) => {
    const {
        bookingId,
        carName,
        carBrand,
        pickup,
        drop,
        startDate,
        endDate,
        startTime,
        totalAmount,
        vendorShare,
        customerName,
        customerPhone,
        customerEmail
    } = details;

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0891b2 0%, #0d9488 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Car Booked Successfully! 🚗 🎉</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; font-weight: 600;">Good news! Your car has been rented on Car Hub</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p style="margin: 0 0 16px 0;">Hello Partner,</p>
        <p style="margin: 0 0 24px 0;">A customer has just booked one of your vehicles. Below are the booking specifics and customer details for your review:</p>
        
        <!-- Vehicle Summary Card -->
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Assigned Vehicle</h3>
          <div style="font-weight: 800; font-size: 16px; color: #0f172a;">${carName}</div>
          <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">${carBrand}</div>
        </div>

        <!-- Booking Details Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 13px; width: 40%;">Booking ID</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a; font-size: 13px;">#${bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 13px;">Pickup Point</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a; font-size: 13px;">${pickup}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 13px;">Drop Point</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a; font-size: 13px;">${drop}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 13px;">Journey Dates</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a; font-size: 13px;">${startDate} to ${endDate} ${startTime || ''}</td>
          </tr>
          <tr style="border-top: 1px dashed #e2e8f0;">
            <td style="padding: 12px 0 8px 0; font-weight: 600; color: #64748b; font-size: 13px;">Customer Paid</td>
            <td style="padding: 12px 0 8px 0; font-weight: 800; color: #0f172a; font-size: 14px;">₹${Number(totalAmount).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #10b981; font-size: 13px;">Your Payout Share</td>
            <td style="padding: 8px 0; font-weight: 800; color: #10b981; font-size: 14px;">₹${Number(vendorShare).toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <!-- Customer Profile -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Customer Profile</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b; font-size: 12px; width: 30%;">Name</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 12px;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b; font-size: 12px;">Phone</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 12px;">${customerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b; font-size: 12px;">Email</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 12px; font-style: italic;">${customerEmail}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">You can manage all booking details from your partner portal.</p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
        <span>This is an automated platform notification from Car Hub. Please do not reply directly to this email.</span>
      </div>
    </div>
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER || "ruturajvidhate5656@gmail.com",
        to: vendorEmail,
        subject: `[Car Hub] Booking Alert - ${carName} has been Rented!`,
        html: htmlContent
    });
};

sendOTP.sendBookingNotificationToVendor = sendBookingNotificationToVendor;

module.exports = sendOTP;
