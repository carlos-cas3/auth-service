const axios = require("axios");
const crypto = require("crypto");

const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL;
const API_KEY = process.env.ANALYTICS_API_KEY;

/**
 * Envía un evento al servicio de analytics (fire-and-forget).
 *
 * @param {{ type: string, aggregateType: string, aggregateId: number|string, vendorIds?: number[], payload?: Object }} eventData
 * @returns {Promise<void>}
 */
async function sendEvent({ type, aggregateType, aggregateId, vendorIds, payload }) {
    if (!ANALYTICS_URL || !API_KEY) return;

    const event = {
        event_id: crypto.randomUUID(),
        type,
        service: "auth-service",
        aggregate_type: aggregateType,
        aggregate_id: String(aggregateId),
        vendor_ids: vendorIds || [],
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
    } catch (error) {
        console.error(`[ANALYTICS_CLIENT] Error enviando evento ${type}: ${error.message}`);
        if (error.response) {
            console.error(`[ANALYTICS_CLIENT] Respuesta del analytics:`, JSON.stringify(error.response.data));
        }
    }
}

module.exports = { sendEvent };
