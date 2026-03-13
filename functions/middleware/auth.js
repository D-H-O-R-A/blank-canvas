/**
 * =========================================================================
 * middleware/auth.js — Autenticação JWT
 * =========================================================================
 *
 * Middleware Express que valida o Bearer token JWT do Firebase Auth.
 * Após validação, injeta no request:
 *   - req.uid: UID do usuário autenticado
 *   - req.decodedToken: token decodificado completo
 *
 * USO:
 *   const { requireAuth } = require("../middleware/auth");
 *   router.get("/rota-protegida", requireAuth, handler);
 *
 * ERROS:
 *   - 401 "Token não fornecido" → header Authorization ausente ou mal formatado
 *   - 401 "Token inválido" → JWT expirado, revogado ou inválido
 * =========================================================================
 */

const { admin } = require("../config");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.decodedToken = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = { requireAuth };
