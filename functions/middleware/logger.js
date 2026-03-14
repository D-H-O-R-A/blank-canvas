/**
 * =========================================================================
 * middleware/logger.js — Registro de logs internos
 * =========================================================================
 */

const { db } = require("../config");

async function logAction(req, res, next) {
  if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    try {
      const summary = JSON.stringify(req.body || {}).slice(0, 500);
      await db.collection("logs").add({
        type: "action",
        endpoint: req.originalUrl || req.path,
        method: req.method,
        uid: req.uid || null,
        timestamp: new Date().toISOString(),
        summary,
        ip: req.headers["x-forwarded-for"] || req.ip || "unknown",
      });
    } catch (e) {
      console.error("logAction error:", e.message);
    }
  }
  next();
}

/**
 * Registra erro detalhado na collection logs.
 * Uso: await logError(req, error) — chamado nos catch blocks.
 */
async function logError(req, error) {
  try {
    await db.collection("logs").add({
      type: "error",
      endpoint: req?.originalUrl || req?.path || "unknown",
      method: req?.method || "unknown",
      uid: req?.uid || null,
      timestamp: new Date().toISOString(),
      error: error?.message || String(error),
      stack: error?.stack || null,
      body: JSON.stringify(req?.body || {}).slice(0, 500),
      ip: req?.headers?.["x-forwarded-for"] || req?.ip || "unknown",
    });
  } catch (e) {
    console.error("logError failed:", e.message);
  }
}

module.exports = { logAction, logError };
