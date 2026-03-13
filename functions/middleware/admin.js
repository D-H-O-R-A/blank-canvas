/**
 * =========================================================================
 * middleware/admin.js — Verificação de administrador
 * =========================================================================
 *
 * Middleware Express que verifica se o usuário autenticado é admin.
 * Consulta o documento `admin/{uid}` no Firestore — campo `isAdmin` deve ser `true`.
 *
 * IMPORTANTE: Deve ser usado APÓS requireAuth (depende de req.uid).
 *
 * USO:
 *   const { requireAuth } = require("../middleware/auth");
 *   const { requireAdmin } = require("../middleware/admin");
 *   router.get("/admin/rota", requireAuth, requireAdmin, handler);
 *
 * COMO DEFINIR UM ADMIN:
 *   No Firebase Console → Firestore → collection "admin" → add document
 *   Document ID = UID do usuário | Campo: isAdmin (boolean) = true
 *
 * ERROS:
 *   - 403 "Acesso restrito a administradores" → doc não existe ou isAdmin !== true
 *   - 403 "Erro ao verificar permissões" → falha na leitura do Firestore
 * =========================================================================
 */

const { db } = require("../config");

async function requireAdmin(req, res, next) {
  try {
    const doc = await db.collection("admin").doc(req.uid).get();
    if (!doc.exists || doc.data().isAdmin !== true) {
      return res.status(403).json({ error: "Acesso restrito a administradores" });
    }
    next();
  } catch {
    return res.status(403).json({ error: "Erro ao verificar permissões" });
  }
}

module.exports = { requireAdmin };
