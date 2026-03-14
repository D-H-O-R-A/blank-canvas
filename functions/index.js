/**
 * =========================================================================
 * index.js — Entry point das Firebase Cloud Functions
 * =========================================================================
 *
 * Inicializa o Express, aplica middlewares globais (CORS, JSON, logger)
 * e monta os routers modulares:
 *
 *   - routes/public.js  → /register, /contact, /webhook/mercadopago
 *   - routes/profile.js → /profile, /create-payment
 *   - routes/admin.js   → /admin/*
 *
 * Exporta como função HTTP única "api" (Firebase Functions 2nd gen).
 *
 * ESTRUTURA DO PROJETO:
 *   functions/
 *   ├── index.js           ← Este arquivo (entry point)
 *   ├── config.js          ← Configuração central (db, admin, secrets, constantes)
 *   ├── middleware/
 *   │   ├── auth.js        ← Validação JWT (requireAuth)
 *   │   ├── admin.js       ← Verificação de admin via Firestore
 *   │   └── logger.js      ← Log automático de POST/PUT
 *   └── routes/
 *       ├── public.js      ← Endpoints sem autenticação
 *       ├── profile.js     ← Endpoints do profissional autenticado
 *       └── admin.js       ← Endpoints administrativos
 * =========================================================================
 */

const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

const { mercadoPagoToken } = require("./config");
const { logAction } = require("./middleware/logger");

// Routers
const publicRoutes = require("./routes/public");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");

// Express app
const app = express();

const allowedOrigins = [
  "https://clickservico.com",
  "https://www.clickservico.com",
  "https://clickservico.com.br",
  "https://www.clickservico.com.br",
  "https://click-servico.web.app",
  "https://click-servico.firebaseapp.com",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, webhooks)
    if (!origin) return callback(null, true);
    // Allow all Lovable preview/project domains
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".lovable.app") ||
      origin.endsWith(".lovableproject.com")
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(logAction);

// Montar rotas
app.use(publicRoutes);
app.use(profileRoutes);
app.use(adminRoutes);

// Export como função HTTP única (2nd gen) com acesso ao secret do MP
exports.api = onRequest({ secrets: [mercadoPagoToken] }, app);
