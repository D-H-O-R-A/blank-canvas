import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();
const db = admin.firestore();

// =====================================================
// IMPORTANT: Set your Mercado Pago access token:
// firebase functions:config:set mercadopago.access_token="YOUR_ACCESS_TOKEN"
//
// Get your token at: https://www.mercadopago.com.br/developers/panel/app
// Use the PRODUCTION access token for live payments.
// =====================================================

const getMercadoPagoToken = (): string => {
  return functions.config().mercadopago?.access_token || "";
};

/**
 * Validates Firebase Auth JWT from Authorization header
 */
async function validateAuth(req: functions.https.Request): Promise<admin.auth.DecodedIdToken> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new functions.https.HttpsError("unauthenticated", "Token não fornecido");
  }
  const token = authHeader.split("Bearer ")[1];
  return admin.auth().verifyIdToken(token);
}

/**
 * CORS headers
 */
function setCorsHeaders(res: functions.Response) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

// =====================================================
// 1. CREATE SUBSCRIPTION
// =====================================================
export const createSubscription = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  try {
    const decoded = await validateAuth(req);
    const uid = decoded.uid;
    const { name, email, whatsapp, profession, plan } = req.body;

    // Determine amount based on plan
    const planConfig: Record<string, { amount: number; frequency: number }> = {
      "1 mês": { amount: 25, frequency: 1 },
      "6 meses": { amount: 23, frequency: 1 }, // Still charged monthly at R$23
    };

    const selectedPlan = planConfig[plan] || planConfig["1 mês"];

    // Save profile to Firestore
    await db.collection("professionals").doc(uid).set({
      name: name || "",
      email: email || decoded.email || "",
      whatsapp: whatsapp || "",
      profession: profession || "",
      plan: plan || "1 mês",
      subscriptionStatus: "pending",
      about: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Create Mercado Pago recurring subscription (preapproval)
    const mpToken = getMercadoPagoToken();
    if (!mpToken) {
      res.status(500).json({ error: "Mercado Pago não configurado. Configure o access_token." });
      return;
    }

    const preapprovalBody = {
      reason: `Click Serviços - Plano ${plan}`,
      auto_recurring: {
        frequency: selectedPlan.frequency,
        frequency_type: "months",
        transaction_amount: selectedPlan.amount,
        currency_id: "BRL",
      },
      payer_email: email || decoded.email,
      back_url: "https://click-servico.web.app/dashboard",
      external_reference: uid,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(preapprovalBody),
    });

    const mpData = await mpResponse.json() as any;

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      res.status(500).json({ error: "Erro ao criar assinatura no Mercado Pago" });
      return;
    }

    // Save preapproval ID
    await db.collection("professionals").doc(uid).update({
      mercadoPagoPreapprovalId: mpData.id,
    });

    res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error: any) {
    console.error("createSubscription error:", error);
    res.status(error.httpErrorCode?.status || 500).json({ error: error.message });
  }
});

// =====================================================
// 2. MERCADO PAGO WEBHOOK
// =====================================================
export const mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  try {
    const { type, data } = req.body;

    // Handle subscription_preapproval notifications
    if (type === "subscription_preapproval" && data?.id) {
      const mpToken = getMercadoPagoToken();

      // Fetch preapproval details from Mercado Pago
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      const preapproval = await mpRes.json() as any;

      if (preapproval.status === "authorized") {
        const uid = preapproval.external_reference;
        if (uid) {
          // Calculate paidUntil based on plan frequency
          const now = new Date();
          const paidUntil = new Date(now);
          paidUntil.setMonth(paidUntil.getMonth() + (preapproval.auto_recurring?.frequency || 1));

          await db.collection("professionals").doc(uid).update({
            subscriptionStatus: "active",
            paidUntil: paidUntil.toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Save payment history
          await db.collection("professionals").doc(uid)
            .collection("payments").add({
              preapprovalId: data.id,
              status: "authorized",
              amount: preapproval.auto_recurring?.transaction_amount,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              paidUntil: paidUntil.toISOString(),
            });
        }
      }
    }

    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(200).json({ ok: true }); // Always return 200 to MP
  }
});

// =====================================================
// 3. GET PROFILE
// =====================================================
export const getProfile = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  try {
    const decoded = await validateAuth(req);
    const doc = await db.collection("professionals").doc(decoded.uid).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    res.status(200).json(doc.data());
  } catch (error: any) {
    console.error("getProfile error:", error);
    res.status(error.httpErrorCode?.status || 500).json({ error: error.message });
  }
});

// =====================================================
// 4. UPDATE PROFILE
// =====================================================
export const updateProfile = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  try {
    const decoded = await validateAuth(req);
    const { name, whatsapp, profession, about, socialLinks } = req.body;

    const updateData: Record<string, any> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (profession !== undefined) updateData.profession = profession;
    if (about !== undefined) updateData.about = about;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    await db.collection("professionals").doc(decoded.uid).update(updateData);

    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("updateProfile error:", error);
    res.status(error.httpErrorCode?.status || 500).json({ error: error.message });
  }
});
