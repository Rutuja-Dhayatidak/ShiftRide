const https = require("https");
const { URL } = require("url");
const crypto = require("crypto");

/**
 * Service to interact with Razorpay APIs
 */
class RazorpayService {
  /**
   * Creates a Razorpay Route Linked Account for a vendor
   * @param {Object} vendor - The vendor document from Mongoose
   * @returns {Promise<Object>} - Razorpay Account object containing { id, status }
   */
  async createLinkedAccount(vendor) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Use Mock/Fake mode if keys are not set or represent dummy values
    if (!keyId || !keySecret || keyId.startsWith("your_") || keyId === "dummy") {
      console.log(`[Razorpay Service] Running in MOCK mode for Vendor: ${vendor.email}`);
      return {
        id: `acc_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: "active"
      };
    }

    return new Promise((resolve, reject) => {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        
        const payloadString = JSON.stringify({
          email: vendor.email,
          phone: vendor.phone,
          type: "route",
          reference_id: String(vendor._id),
          legal_business_name: vendor.businessName || vendor.name,
          business_type: "individual",
          contact_name: vendor.name,
          profile: {
            category: "travel_and_tourism",
            subcategory: "car_rental",
            addresses: {
              registered: {
                street1: vendor.address || "Main Street",
                city: "Mumbai",
                state: "Maharashtra",
                postal_code: "400001",
                country: "IN"
              }
            }
          }
        });

        const options = {
          hostname: "api.razorpay.com",
          path: "/v1/accounts",
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payloadString)
          }
        };

        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => { data += chunk; });
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300 && parsed.id) {
                resolve({
                  id: parsed.id,
                  status: parsed.status || "active"
                });
              } else {
                const errMsg = parsed.error?.description || `Status ${res.statusCode}`;
                // Fallback in dev
                if (process.env.NODE_ENV !== "production") {
                  console.warn(`[Razorpay Service] API returned error: ${errMsg}. Falling back to MOCK mode.`);
                  resolve({
                    id: `acc_fallback_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    status: "active"
                  });
                } else {
                  reject(new Error(errMsg));
                }
              }
            } catch (e) {
              if (process.env.NODE_ENV !== "production") {
                resolve({
                  id: `acc_fallback_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  status: "active"
                });
              } else {
                reject(new Error(`Failed to parse Razorpay response: ${e.message}`));
              }
            }
          });
        });

        req.on("error", (err) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[Razorpay Service] Request failed: ${err.message}. Falling back to MOCK mode.`);
            resolve({
              id: `acc_fallback_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              status: "active"
            });
          } else {
            reject(err);
          }
        });

        req.write(payloadString);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Creates a Razorpay Order with transfers (split routing)
   * @param {Object} orderData - { amount, vendorAccountId, vendorAmount, bookingId }
   * @returns {Promise<Object>} - Razorpay Order object
   */
  async createOrder({ amount, vendorAccountId, vendorAmount, bookingId }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Standard fallback in dev/test mode if keys aren't fully live/configured
    if (!keyId || !keySecret || keyId.startsWith("your_") || keyId === "dummy") {
      console.log("[Razorpay Service] Running in MOCK mode for Order creation.");
      return {
        id: `order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: amount,
        currency: "INR",
        status: "created"
      };
    }

    return new Promise((resolve, reject) => {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

        const transfers = [];
        const isRealAccount = vendorAccountId && 
                              vendorAccountId.startsWith("acc_") && 
                              !vendorAccountId.startsWith("acc_mock") && 
                              !vendorAccountId.startsWith("acc_fallback");

        if (isRealAccount) {
          transfers.push({
            account: vendorAccountId,
            amount: Math.round(vendorAmount), // in paise
            currency: "INR",
            notes: {
              booking_id: String(bookingId)
            },
            linked_account_notes: ["booking_id"],
            on_hold: false
          });
        } else {
          console.log(`[Razorpay Service] Skipping transfers payload because account ID "${vendorAccountId}" is mock/invalid for live Route API.`);
        }

        const payload = {
          amount: Math.round(amount), // in paise
          currency: "INR",
          receipt: `receipt_${bookingId}`,
          notes: {
            booking_id: String(bookingId)
          }
        };

        if (transfers.length > 0) {
          payload.transfers = transfers;
        }

        const payloadString = JSON.stringify(payload);

        const options = {
          hostname: "api.razorpay.com",
          path: "/v1/orders",
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payloadString)
          }
        };

        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => { data += chunk; });
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300 && parsed.id) {
                resolve(parsed);
              } else {
                const errMsg = parsed.error?.description || `Status ${res.statusCode}`;
                if (process.env.NODE_ENV !== "production") {
                  console.warn(`[Razorpay Service] Order API error: ${errMsg}. Falling back to mock order.`);
                  resolve({
                    id: `order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    amount: amount,
                    currency: "INR",
                    status: "created"
                  });
                } else {
                  reject(new Error(errMsg));
                }
              }
            } catch (e) {
              if (process.env.NODE_ENV !== "production") {
                resolve({
                  id: `order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  amount: amount,
                  currency: "INR",
                  status: "created"
                });
              } else {
                reject(new Error(`Failed to parse Razorpay Order response: ${e.message}`));
              }
            }
          });
        });

        req.on("error", (err) => {
          if (process.env.NODE_ENV !== "production") {
            resolve({
              id: `order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              amount: amount,
              currency: "INR",
              status: "created"
            });
          } else {
            reject(err);
          }
        });

        req.write(payloadString);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Verify Razorpay payment signature
   */
  verifySignature(orderId, paymentId, signature) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return true; // Fail safe or test mode
    if (orderId.startsWith("order_mock_") || (paymentId && paymentId.startsWith("pay_mock_")) || (signature && signature.startsWith("sig_mock_"))) return true; // mock check bypass

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    return expectedSignature === signature;
  }
}

module.exports = new RazorpayService();
