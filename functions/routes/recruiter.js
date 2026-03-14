/**
 * routes/recruiter.js — Endpoints do recrutador
 */

const express = require("express");
const router = express.Router();
const { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { requireRecruiter } = require("../middleware/recruiter");
const { logError } = require("../middleware/logger");

// ----- POST /recruiter/register (public) -----
router.post("/recruiter/register", async (req, res) => {
  try {
    const { name, email, password, whatsapp, profession, birthDate, cpf, address, pixKey, photo, photoContentType } = req.body;

    if (!name || !email || !password || !whatsapp || !cpf || !pixKey) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password, displayName: name });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "E-mail já cadastrado.", code: "EMAIL_EXISTS" });
      }
      throw authError;
    }

    const uid = userRecord.uid;
    let photoURL = "";

    // Upload photo if provided
    if (photo) {
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
      name,
      email,
      whatsapp,
      profession: profession || "",
      birthDate: birthDate || null,
      cpf,
      address: address || "",
      pixKey,
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

// ----- GET /recruiter/profile -----
router.get("/recruiter/profile", requireAuth, requireRecruiter, async (req, res) => {
  try {
    return res.status(200).json(req.recruiter);
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

    if (!name || !email || !password || !whatsapp || !plan) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password, displayName: name });
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

    // Create professional doc
    await db.collection("professionals").doc(clientUid).set({
      name, email, whatsapp,
      profession: profession || "",
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

    // Generate MP payment link
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
        external_reference: clientUid,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return res.status(500).json({ error: "Erro ao criar pagamento" });
    }

    await db.collection("professionals").doc(clientUid).update({ mercadoPagoPreapprovalId: mpData.id });

    // Store in recruiter's clients subcollection
    await db.collection("recruiters").doc(req.uid).collection("clients").doc(clientUid).set({
      name, email, whatsapp, profession: profession || "", plan,
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

    // Delete professional doc and auth user
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

    // Deduct from available balance
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

module.exports = router;
