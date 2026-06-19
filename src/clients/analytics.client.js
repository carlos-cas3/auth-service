const axios = require("axios");
const crypto = require("crypto");

const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL;
const API_KEY = process.env.ANALYTICS_API_KEY;

const sendEvent = async ({ type, aggregateType, aggregateId, vendorId, payload }) => {
  if (!ANALYTICS_URL || !API_KEY) return;

  const event = {
    event_id: crypto.randomUUID(),
    type,
    service: "auth-service",
    aggregate_type: aggregateType,
    aggregate_id: aggregateId,
    vendor_id: vendorId || null,
    event_timestamp: new Date().toISOString(),
    payload: payload || {},
  };

  try {
    await axios.post(`${ANALYTICS_URL}/api/events`, event, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      timeout: 5000,
    });
  } catch {
    // Fail silently — analytics should never break auth flow
  }
};

module.exports = { sendEvent };
