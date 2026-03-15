/**
 * routes/recruiter.js — Endpoints do recrutador
 */

const express = require("express");
const router = express.Router();
const { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { requireRecruiter } = require("../middleware/recruiter");
const { logError } = require("../middleware/logger");

// ===================== VALIDATION HELPERS =====================

function validateCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(cleaned[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(cleaned[10]) === check;
}

function validateEmail(email) {
  if (!email || email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

function validateName(name) {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
}

function validatePassword(password) {
  return password && password.length >= 6 && password.length <= 128;
}

// ----- POST /recruiter/register (public) -----
router.post("/recruiter/register", async (req, res) => {
  try {
    const { name, email, password, whatsapp, profession, birthDate, cpf, address, pixKey, photo, photoContentType } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: "Nome deve ter entre 2 e 100 caracteres" });
    if (!validateEmail(email)) return res.status(400).json({ error: "E-mail inválido (máx. 255 caracteres)" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Senha deve ter entre 6 e 128 caracteres" });
    if (!validatePhone(whatsapp)) return res.status(400).json({ error: "WhatsApp inválido (10-11 dígitos)" });
    if (!validateCPF(cpf)) return res.status(400).json({ error: "CPF inválido" });
    if (!pixKey || pixKey.trim().length < 5 || pixKey.trim().length > 100) return res.status(400).json({ error: "Chave PIX inválida (5-100 caracteres)" });
    if (address && address.length > 200) return res.status(400).json({ error: "Endereço muito longo (máx. 200 caracteres)" });
    if (profession && profession.length > 100) return res.status(400).json({ error: "Profissão muito longa (máx. 100 caracteres)" });

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email: email.trim(), password, displayName: name.trim() });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "E-mail já cadastrado.", code: "EMAIL_EXISTS" });
      }
      throw authError;
    }

    const uid = userRecord.uid;
    let photoURL = "";

    if (photo) {
      if (photo.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Foto muito grande (máx 5MB)" });
      try {
        const bucket = admin.storage().bucket();
        const ext = photoContentType === "image/png" ? "png" : "jpg";
        const filePath = `recruiter-photos/${uid}.${ext}`;
        const file = bucket.file(filePath);
        const buffer = Buffer.from(photo, "base64");
        await file.save(buffer, { metadata: { contentType: photoContentType || "image/jpeg" }, public: true });
        photoURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        await admin.auth().updateUser(uid, { photoURL });
      } catch (e) {
        console.error("recruiter photo upload error:", e.message);
      }
    }

    await db.collection("recruiters").doc(uid).set({
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      profession: (profession || "").trim().slice(0, 100),
      birthDate: birthDate || null,
      cpf: cpf.replace(/\D/g, ""),
      address: (address || "").trim().slice(0, 200),
      pixKey: pixKey.trim(),
      photoURL,
      commissionPercent: 25,
      totalCommission: 0,
      availableBalance: 0,
      blocked: false,
      approved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true, uid });
  } catch (error) {
    console.error("recruiter/register error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /recruiter/profile (accessible even if not approved, also if blocked) -----
router.get("/recruiter/profile", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("recruiters").doc(req.uid).get();
    if (!doc.exists) return res.status(403).json({ error: "Acesso restrito a recrutadores" });
    return res.status(200).json(doc.data());
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /recruiter/profile -----
router.put("/recruiter/profile", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const allowed = ["name", "whatsapp", "profession", "address", "pixKey"];
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    for (const field of allowed) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (req.body.name && !validateName(req.body.name)) return res.status(400).json({ error: "Nome inválido" });
    if (req.body.whatsapp && !validatePhone(req.body.whatsapp)) return res.status(400).json({ error: "WhatsApp inválido" });

    await db.collection("recruiters").doc(req.uid).update(updateData);
    if (req.body.name) {
      try { await admin.auth().updateUser(req.uid, { displayName: req.body.name }); } catch (e) { /* ignore */ }
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /recruiter/photo -----
router.post("/recruiter/photo", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const { photo, contentType } = req.body;
    if (!photo) return res.status(400).json({ error: "Foto não enviada" });
    if (photo.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Foto muito grande (máx 5MB)" });

    const bucket = admin.storage().bucket();
    const ext = contentType === "image/png" ? "png" : "jpg";
    const filePath = `recruiter-photos/${req.uid}.${ext}`;
    const file = bucket.file(filePath);
    const buffer = Buffer.from(photo, "base64");
    await file.save(buffer, { metadata: { contentType: contentType || "image/jpeg" }, public: true });
    const photoURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    await admin.auth().updateUser(req.uid, { photoURL });
    await db.collection("recruiters").doc(req.uid).update({ photoURL, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    return res.status(200).json({ ok: true, photoURL });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /recruiter/clients -----
router.post("/recruiter/clients", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const { name, email, password, whatsapp, profession, plan, birthDate } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: "Nome deve ter entre 2 e 100 caracteres" });
    if (!validateEmail(email)) return res.status(400).json({ error: "E-mail inválido" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Senha deve ter entre 6 e 128 caracteres" });
    if (!validatePhone(whatsapp)) return res.status(400).json({ error: "WhatsApp inválido (10-11 dígitos)" });
    if (!plan) return res.status(400).json({ error: "Plano é obrigatório" });

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email: email.trim(), password, displayName: name.trim() });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "E-mail já cadastrado.", code: "EMAIL_EXISTS" });
      }
      throw authError;
    }

    const clientUid = userRecord.uid;
    const selectedPlan = PLAN_CONFIG[plan] || PLAN_CONFIG["1 mês"];
    const recruiterData = req.recruiter;
    const commissionPercent = recruiterData.commissionPercent || 25;

    await db.collection("professionals").doc(clientUid).set({
      name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim(),
      profession: (profession || "").trim().slice(0, 100),
      plan,
      birthDate: birthDate || null,
      subscriptionStatus: "pending",
      about: "",
      photoURL: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      recruitedBy: req.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

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
        payer_email: email.trim(),
        back_url: `${APP_BASE_URL}/pagamento-sucesso`,
        external_reference: clientUid,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return res.status(500).json({ error: "Erro ao criar pagamento" });
    }

    await db.collection("professionals").doc(clientUid).update({ mercadoPagoPreapprovalId: mpData.id });

    await db.collection("recruiters").doc(req.uid).collection("clients").doc(clientUid).set({
      name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim(), profession: (profession || "").trim(), plan,
      paymentStatus: "pending",
      paymentUrl: mpData.init_point,
      mercadoPagoId: mpData.id,
      commissionPercent,
      commissionAmount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true, uid: clientUid, paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("recruiter/clients POST error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /recruiter/clients -----
router.get("/recruiter/clients", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const snap = await db.collection("recruiters").doc(req.uid).collection("clients").orderBy("createdAt", "desc").get();
    const clients = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json(clients);
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- DELETE /recruiter/clients/:uid -----
router.delete("/recruiter/clients/:uid", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const { uid } = req.params;
    const clientDoc = await db.collection("recruiters").doc(req.uid).collection("clients").doc(uid).get();
    if (!clientDoc.exists) return res.status(404).json({ error: "Cliente não encontrado" });

    if (clientDoc.data().paymentStatus === "paid") {
      return res.status(400).json({ error: "Não é possível excluir cliente com pagamento confirmado" });
    }

    await db.collection("professionals").doc(uid).delete();
    try { await admin.auth().deleteUser(uid); } catch (e) { /* ignore */ }
    await db.collection("recruiters").doc(req.uid).collection("clients").doc(uid).delete();

    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /recruiter/withdrawals -----
router.post("/recruiter/withdrawals", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const { amount } = req.body;
    const recruiterDoc = await db.collection("recruiters").doc(req.uid).get();
    const data = recruiterDoc.data();

    if (!amount || amount <= 0) return res.status(400).json({ error: "Valor inválido" });
    if (amount > (data.availableBalance || 0)) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    await db.collection("recruiters").doc(req.uid).collection("withdrawals").add({
      amount,
      status: "pending",
      pixKey: data.pixKey,
      receiptURL: null,
      requestedAt: new Date().toISOString(),
      processedAt: null,
      processedBy: null,
    });

    await db.collection("recruiters").doc(req.uid).update({
      availableBalance: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /recruiter/withdrawals -----
router.get("/recruiter/withdrawals", requireAuth, requireRecruiter, async (req, res) => {
  try {
    const snap = await db.collection("recruiters").doc(req.uid).collection("withdrawals").orderBy("requestedAt", "desc").get();
    const withdrawals = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(withdrawals);
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /recruiter/contact (for blocked recruiters to contest) -----
router.post("/recruiter/contact", requireAuth, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!message || message.trim().length < 10 || message.length > 1000) {
      return res.status(400).json({ error: "Mensagem deve ter entre 10 e 1000 caracteres" });
    }

    await db.collection("contacts").add({
      name: (name || "").trim().slice(0, 100),
      email: (email || "").trim().slice(0, 255),
      phone: "",
      subject: "Contestação de bloqueio - Recrutador",
      message: message.trim(),
      status: "pending",
      read: false,
      recruiterUid: req.uid,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
