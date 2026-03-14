/**
 * middleware/recruiter.js — Verifica se o usuário é um recrutador
 */

const { db } = require("../config");

async function requireRecruiter(req, res, next) {
  try {
    const doc = await db.collection("recruiters").doc(req.uid).get();
    if (!doc.exists) {
      return res.status(403).json({ error: "Acesso restrito a recrutadores" });
    }
    if (doc.data().blocked) {
      return res.status(403).json({ error: "Recrutador bloqueado" });
    }
    if (doc.data().approved !== true) {
      return res.status(403).json({ error: "Recrutador aguardando aprovação", code: "PENDING_APPROVAL" });
    }
    req.recruiter = doc.data();
    next();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao verificar recrutador" });
  }
}

module.exports = { requireRecruiter };
