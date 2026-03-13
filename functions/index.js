/**
 * =========================================================================
 * Click Serviços - Firebase Cloud Functions (2nd Gen)
 * =========================================================================
 *
 * ÍNDICE DE SEÇÕES:
 * 1. Imports & Inicialização
 * 2. Middlewares (CORS, Auth, Admin, Logging)
 * 3. Endpoints Públicos
 *    - POST /register       → Cadastro de profissional + assinatura MP
 *    - POST /contact        → Formulário de contato
 *    - POST /webhook/mercadopago → Webhook do Mercado Pago
 * 4. Endpoints Protegidos (JWT)
 *    - GET  /profile        → Perfil do profissional logado
 *    - PUT  /profile        → Atualizar perfil
 *    - POST /create-payment → Gerar novo link de pagamento
 * 5. Endpoints Admin (JWT + claim admin=true)
 *    - GET  /admin/stats         → Contadores gerais
 *    - GET  /admin/users         → Listar profissionais
 *    - POST /admin/users         → Criar profissional (admin)
 *    - PUT  /admin/users/:uid    → Editar profissional
 *    - GET  /admin/payments      → Listar pagamentos
 *    - GET  /admin/logs          → Listar logs internos
 *    - GET  /admin/contacts      → Listar contatos
 *    - PUT  /admin/contacts/:id  → Marcar contato como lido
 * 6. Export
 *
 * COLLECTIONS FIRESTORE:
 *   professionals/{uid}          → Perfil do profissional
 *   professionals/{uid}/payments → Pagamentos do profissional
 *   contacts/{id}                → Formulários de contato
 *   logs/{id}                    → Logs internos (POST/PUT)
 * =========================================================================
 */

// =========================================================================
// 1. IMPORTS & INICIALIZAÇÃO
// =========================================================================

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

/** @type {FirebaseFirestore.Firestore} */
const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

/** Secret do Mercado Pago — configure com: firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN */
const mercadoPagoToken = defineSecret("MERCADOPAGO_ACCESS_TOKEN");

/** URL base do app para redirecionamentos */
const APP_BASE_URL = "https://click-servico.web.app";

/** Configuração dos planos disponíveis */
const PLAN_CONFIG = {
  "1 mês": { amount: 25, frequency: 1 },
  "6 meses": { amount: 23, frequency: 1 },
};

// =========================================================================
// 2. MIDDLEWARES
// =========================================================================

/**
 * Middleware: Valida Bearer token JWT do Firebase Auth.
 * Adiciona req.uid e req.decodedToken ao request.
 */
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

/**
 * Middleware: Verifica se o usuário autenticado é admin.
 * Consulta o documento admin/{uid} no Firestore — campo isAdmin deve ser true.
 * Deve ser usado APÓS requireAuth.
 */
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

/**
 * Middleware: Registra log de toda interação POST/PUT no Firestore.
 * Captura endpoint, método, UID, timestamp, resumo do body e IP.
 */
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

// Aplica logging global para POST/PUT
app.use(logAction);

// =========================================================================
// 3. ENDPOINTS PÚBLICOS
// =========================================================================

/**
 * POST /register
 * Cria usuário no Firebase Auth, perfil no Firestore e assinatura no Mercado Pago.
 *
 * @body {string} name       - Nome completo (obrigatório)
 * @body {string} email      - E-mail (obrigatório)
 * @body {string} password   - Senha, mín 6 chars (obrigatório)
 * @body {string} whatsapp   - WhatsApp (obrigatório)
 * @body {string} profession - Profissão (opcional)
 * @body {string} plan       - "1 mês" ou "6 meses" (obrigatório)
 *
 * @returns {object} { paymentUrl: string }
 */
app.post("/register", async (req, res) => {
  try {
    const { name, email, whatsapp, profession, password, plan } = req.body;

    // Validação
    if (!name || !email || !password || !plan || !whatsapp) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    // Criar usuário no Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password, displayName: name });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "E-mail já cadastrado. Faça login.", code: "EMAIL_EXISTS" });
      }
      throw authError;
    }

    const uid = userRecord.uid;
    const selectedPlan = PLAN_CONFIG[plan] || PLAN_CONFIG["1 mês"];

    // Salvar perfil no Firestore
    await db.collection("professionals").doc(uid).set({
      name,
      email,
      whatsapp,
      profession: profession || "",
      plan,
      subscriptionStatus: "pending",
      about: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Criar assinatura no Mercado Pago
    const mpToken = mercadoPagoToken.value();
    if (!mpToken) {
      return res.status(500).json({ error: "Mercado Pago não configurado." });
    }

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${mpToken}` },
      body: JSON.stringify({
        reason: `Click Serviços - Plano ${plan}`,
        auto_recurring: {
          frequency: selectedPlan.frequency,
          frequency_type: "months",
          transaction_amount: selectedPlan.amount,
          currency_id: "BRL",
        },
        payer_email: email,
        back_url: `${APP_BASE_URL}/pagamento-sucesso`,
        external_reference: uid,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      return res.status(500).json({ error: "Erro ao criar assinatura no Mercado Pago" });
    }

    await db.collection("professionals").doc(uid).update({ mercadoPagoPreapprovalId: mpData.id });

    return res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
});

/**
 * POST /contact
 * Salva formulário de contato no Firestore (collection contacts).
 *
 * @body {string} name    - Nome (obrigatório)
 * @body {string} email   - E-mail (obrigatório)
 * @body {string} phone   - Telefone (opcional)
 * @body {string} subject - Assunto (obrigatório)
 * @body {string} message - Mensagem (obrigatório)
 *
 * @returns {object} { ok: true, id: string }
 */
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Preencha nome, e-mail, assunto e mensagem" });
    }
    if (name.length > 100 || email.length > 255 || message.length > 1000) {
      return res.status(400).json({ error: "Dados excedem o tamanho máximo permitido" });
    }

    const docRef = await db.collection("contacts").add({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      subject: subject.trim(),
      message: message.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("contact error:", error);
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
});

/**
 * POST /webhook/mercadopago
 * Recebe notificações do Mercado Pago sobre status de assinaturas.
 * Atualiza status do profissional e registra pagamento.
 *
 * @body {string} type   - Tipo do evento (ex: "subscription_preapproval")
 * @body {object} data   - Dados do evento { id: string }
 */
app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "subscription_preapproval" && data?.id) {
      const mpToken = mercadoPagoToken.value();
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      const preapproval = await mpRes.json();

      if (preapproval.status === "authorized") {
        const uid = preapproval.external_reference;
        if (uid) {
          const now = new Date();
          const paidUntil = new Date(now);
          paidUntil.setMonth(paidUntil.getMonth() + (preapproval.auto_recurring?.frequency || 1));

          // Atualizar status do profissional
          await db.collection("professionals").doc(uid).update({
            subscriptionStatus: "active",
            paidUntil: paidUntil.toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Registrar pagamento
          await db.collection("professionals").doc(uid).collection("payments").add({
            preapprovalId: data.id,
            status: "authorized",
            amount: preapproval.auto_recurring?.transaction_amount,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            paidUntil: paidUntil.toISOString(),
          });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ ok: true });
  }
});

// =========================================================================
// 4. ENDPOINTS PROTEGIDOS (JWT)
// =========================================================================

/**
 * GET /profile
 * Retorna perfil do profissional autenticado.
 *
 * @header Authorization: Bearer <JWT>
 * @returns {object} Dados do perfil
 */
app.get("/profile", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("professionals").doc(req.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
    return res.status(200).json(doc.data());
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /profile
 * Atualiza perfil do profissional autenticado.
 *
 * @header Authorization: Bearer <JWT>
 * @body {string} [name]
 * @body {string} [whatsapp]
 * @body {string} [profession]
 * @body {string} [about]
 * @body {object} [socialLinks]
 *
 * @returns {object} { ok: true }
 */
app.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, whatsapp, profession, about, socialLinks } = req.body;
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (name !== undefined) updateData.name = name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (profession !== undefined) updateData.profession = profession;
    if (about !== undefined) updateData.about = about;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    await db.collection("professionals").doc(req.uid).update(updateData);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /create-payment
 * Gera novo link de pagamento do Mercado Pago para o profissional autenticado.
 *
 * @header Authorization: Bearer <JWT>
 * @body {string} [plan] - Plano desejado (usa o plano atual se não informado)
 *
 * @returns {object} { paymentUrl: string }
 */
app.post("/create-payment", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("professionals").doc(req.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }

    const profile = doc.data();
    const plan = req.body.plan || profile.plan || "1 mês";
    const selectedPlan = PLAN_CONFIG[plan] || PLAN_CONFIG["1 mês"];

    const mpToken = mercadoPagoToken.value();
    if (!mpToken) {
      return res.status(500).json({ error: "Mercado Pago não configurado." });
    }

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${mpToken}` },
      body: JSON.stringify({
        reason: `Click Serviços - Plano ${plan}`,
        auto_recurring: {
          frequency: selectedPlan.frequency,
          frequency_type: "months",
          transaction_amount: selectedPlan.amount,
          currency_id: "BRL",
        },
        payer_email: profile.email,
        back_url: `${APP_BASE_URL}/pagamento-sucesso`,
        external_reference: req.uid,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return res.status(500).json({ error: "Erro ao criar pagamento" });
    }

    await db.collection("professionals").doc(req.uid).update({ mercadoPagoPreapprovalId: mpData.id });

    return res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("create-payment error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// 5. ENDPOINTS ADMIN (JWT + documento admin/{uid} no Firestore)
// =========================================================================

/**
 * GET /admin/check
 * Verifica se o usuário autenticado é admin.
 * Consulta admin/{uid}.isAdmin no Firestore.
 *
 * @header Authorization: Bearer <JWT>
 * @returns {object} { isAdmin: boolean }
 */
app.get("/admin/check", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("admin").doc(req.uid).get();
    return res.status(200).json({ isAdmin: doc.exists && doc.data().isAdmin === true });
  } catch (error) {
    console.error("admin/check error:", error);
    return res.status(500).json({ isAdmin: false });
  }
});

/**
 * GET /admin/stats
 * Retorna contadores gerais do sistema.
 *
 * @returns {object} { totalUsers, activeUsers, pendingUsers, totalPayments, successPayments, failedPayments, pendingPayments, totalContacts, unreadContacts, totalLogs }
 */
app.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Contar profissionais
    const usersSnap = await db.collection("professionals").get();
    let activeUsers = 0;
    let pendingUsers = 0;
    const userDocs = usersSnap.docs;
    for (const doc of userDocs) {
      const d = doc.data();
      if (d.subscriptionStatus === "active") activeUsers++;
      else pendingUsers++;
    }

    // Contar pagamentos (subcollection de cada profissional)
    let totalPayments = 0, successPayments = 0, failedPayments = 0, pendingPaymentsCount = 0;
    for (const doc of userDocs) {
      const paymentsSnap = await db.collection("professionals").doc(doc.id).collection("payments").get();
      totalPayments += paymentsSnap.size;
      for (const p of paymentsSnap.docs) {
        const s = p.data().status;
        if (s === "authorized" || s === "active") successPayments++;
        else if (s === "pending") pendingPaymentsCount++;
        else failedPayments++;
      }
    }

    // Contar contatos
    const contactsSnap = await db.collection("contacts").get();
    let unreadContacts = 0;
    for (const doc of contactsSnap.docs) {
      if (!doc.data().read) unreadContacts++;
    }

    // Contar logs
    const logsSnap = await db.collection("logs").get();

    return res.status(200).json({
      totalUsers: userDocs.length,
      activeUsers,
      pendingUsers,
      totalPayments,
      successPayments,
      failedPayments,
      pendingPayments: pendingPaymentsCount,
      totalContacts: contactsSnap.size,
      unreadContacts,
      totalLogs: logsSnap.size,
    });
  } catch (error) {
    console.error("admin/stats error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/users
 * Lista todos os profissionais cadastrados.
 *
 * @returns {Array} Lista de profissionais com uid
 */
app.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("professionals").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json(users);
  } catch (error) {
    console.error("admin/users GET error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin/users
 * Cria novo profissional (admin cria conta + perfil).
 *
 * @body {string} name       - Nome (obrigatório)
 * @body {string} email      - E-mail (obrigatório)
 * @body {string} password   - Senha (obrigatório, mín 6)
 * @body {string} whatsapp   - WhatsApp
 * @body {string} profession - Profissão
 * @body {string} plan       - Plano
 *
 * @returns {object} { ok: true, uid: string }
 */
app.post("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, whatsapp, profession, plan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    const userRecord = await admin.auth().createUser({ email, password, displayName: name });

    await db.collection("professionals").doc(userRecord.uid).set({
      name,
      email,
      whatsapp: whatsapp || "",
      profession: profession || "",
      plan: plan || "1 mês",
      subscriptionStatus: "pending",
      about: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true, uid: userRecord.uid });
  } catch (error) {
    console.error("admin/users POST error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /admin/users/:uid
 * Atualiza dados de qualquer profissional.
 *
 * @param {string} uid - UID do profissional
 * @body {object} Campos a atualizar (name, whatsapp, profession, about, plan, subscriptionStatus, paidUntil, socialLinks)
 *
 * @returns {object} { ok: true }
 */
app.put("/admin/users/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const allowedFields = ["name", "whatsapp", "profession", "about", "plan", "subscriptionStatus", "paidUntil", "socialLinks"];
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await db.collection("professionals").doc(uid).update(updateData);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/users PUT error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/payments
 * Lista todos os pagamentos de todos os profissionais.
 *
 * @returns {Array} Lista de pagamentos com dados do profissional
 */
app.get("/admin/payments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersSnap = await db.collection("professionals").get();
    const payments = [];

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const paymentsSnap = await db
        .collection("professionals")
        .doc(userDoc.id)
        .collection("payments")
        .orderBy("paidAt", "desc")
        .get();

      for (const pDoc of paymentsSnap.docs) {
        const pData = pDoc.data();
        payments.push({
          id: pDoc.id,
          professionalUid: userDoc.id,
          professionalName: userData.name,
          professionalEmail: userData.email,
          ...pData,
          paidAt: pData.paidAt?.toDate?.()?.toISOString?.() || pData.paidAt || null,
        });
      }
    }

    // Ordenar por data mais recente
    payments.sort((a, b) => (b.paidAt || "").localeCompare(a.paidAt || ""));

    return res.status(200).json(payments);
  } catch (error) {
    console.error("admin/payments error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/logs
 * Lista logs internos ordenados por data (mais recente primeiro).
 *
 * @returns {Array} Lista de logs { id, endpoint, method, uid, timestamp, summary, ip }
 */
app.get("/admin/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("logs").orderBy("timestamp", "desc").limit(500).get();
    const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(logs);
  } catch (error) {
    console.error("admin/logs error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/contacts
 * Lista todos os formulários de contato recebidos.
 *
 * @returns {Array} Lista de contatos { id, name, email, phone, subject, message, createdAt, read }
 */
app.get("/admin/contacts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("contacts").orderBy("createdAt", "desc").get();
    const contacts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(contacts);
  } catch (error) {
    console.error("admin/contacts error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /admin/contacts/:id
 * Marca formulário de contato como lido/não lido.
 *
 * @param {string} id - ID do documento de contato
 * @body {boolean} read - Status de leitura
 *
 * @returns {object} { ok: true }
 */
app.put("/admin/contacts/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    await db.collection("contacts").doc(id).update({ read: !!read });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/contacts PUT error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// =========================================================================
// 6. EXPORT
// =========================================================================

/** Exporta como função HTTP única "api" (2nd gen) com acesso ao secret */
exports.api = onRequest(
  { secrets: [mercadoPagoToken] },
  app
);
