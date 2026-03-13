/**
 * =========================================================================
 * middleware/logger.js — Registro de logs internos
 * =========================================================================
 *
 * Middleware Express que registra automaticamente toda interação POST/PUT
 * na collection `logs` do Firestore.
 *
 * Dados capturados:
 *   - endpoint: URL chamada (req.originalUrl)
 *   - method: "POST" ou "PUT"
 *   - uid: UID do usuário (se autenticado, senão null)
 *   - timestamp: ISO 8601
 *   - summary: JSON do body truncado em 500 caracteres
 *   - ip: IP de origem (x-forwarded-for ou req.ip)
 *
 * USO:
 *   const { logAction } = require("./middleware/logger");
 *   app.use(logAction);  // aplica globalmente
 *
 * NOTA: Erros no logging são silenciosos (não bloqueiam a requisição).
 * =========================================================================
 */

const { db } = require("../config");

async function logAction(req, res, next) {
  if (req.method === "POST" || req.method === "PUT") {
    try {
      const summary = JSON.stringify(req.body || {}).slice(0, 500);
      await db.collection("logs").add({
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

module.exports = { logAction };
