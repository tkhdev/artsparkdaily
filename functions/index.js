// Firebase Functions - functions/index.js
const { onSchedule } = require("firebase-functions/v2/scheduler");
const {
  onCall,
  HttpsError,
  onRequest
} = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { curatedChallenges } = require("./constants/challenges");
const { challengeElements } = require("./constants/challengeElements");
const crypto = require("crypto");
const { defineSecret } = require("firebase-functions/params");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Set global options for all functions
setGlobalOptions({
  region: "us-central1"
});

const PADDLE_WEBHOOK_SECRET = defineSecret("PADDLE_WEBHOOK_SECRET");

// Helper function to require authentication
function requireAuth(request, functionName) {
  if (!request.auth) {
    logger.warn(`${functionName}: Unauthenticated request`);
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  return request.auth;
}

// Helper function to verify Paddle webhook signature
function verifyPaddleSignature(rawBody, signature, secret) {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    logger.error("Error verifying Paddle signature:", error);
    return false;
  }
}

exports.paddleWebhook = onRequest(
  {
    cors: false,
    enforceAppCheck: false,
    secrets: [PADDLE_WEBHOOK_SECRET]
  },
  async (request, response) => {
    try {
      if (request.method !== "POST") {
        logger.warn("Paddle webhook: Invalid method", request.method);
        return response.status(405).send("Method not allowed");
      }

      const signature = request.headers["paddle-signature"];

      // Get raw body - Paddle sends JSON
      const rawBody = request.rawBody
        ? request.rawBody.toString()
        : JSON.stringify(request.body);

      const secretValue = PADDLE_WEBHOOK_SECRET.value();

      if (!secretValue) {
        logger.error("Paddle webhook: Missing webhook secret");
        return response.status(500).send("Webhook secret not configured");
      }

      if (!signature) {
        logger.warn("Paddle webhook: Missing signature");
        return response.status(400).send("Missing signature");
      }

      if (!verifyPaddleSignature(rawBody, signature, secretValue)) {
        logger.warn("Paddle webhook: Invalid signature");
        return response.status(400).send("Invalid signature");
      }

      // Parse the event
      const event = request.body;
      logger.info("Paddle webhook received:", {
        eventType: event.event_type,
        eventId: event.event_id || "unknown"
      });

      // Handle different event types
      switch (event.event_type) {
        case "subscription.created":
          await handleSubscriptionCreated(event.data);
          break;

        case "subscription.updated":
          await handleSubscriptionUpdated(event.data);
          break;

        case "subscription.canceled":
          await handleSubscriptionCanceled(event.data);
          break;

        case "subscription.paused":
          await handleSubscriptionPaused(event.data);
          break;

        case "subscription.resumed":
          await handleSubscriptionResumed(event.data);
          break;

        case "transaction.completed":
          await handleTransactionCompleted(event.data);
          break;

        case "transaction.updated":
          await handleTransactionUpdated(event.data);
          break;

        case "customer.created":
          await handleCustomerCreated(event.data);
          break;

        default:
          logger.info("Unhandled Paddle webhook event:", event.event_type);
      }

      response.status(200).send("OK");
    } catch (error) {
      logger.error("Paddle webhook error:", error);
      response.status(500).send("Internal server error");
    }
  }
);

// Handle subscription created
// Handle subscription created - FIXED
async function handleSubscriptionCreated(subscription) {
  try {
    logger.info("Processing subscription.created:", subscription.id);

    const customData = subscription.custom_data || {};
    const userId = customData.userId;

    if (!userId) {
      logger.error("No userId found in subscription custom_data");
      return;
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.error("User not found:", userId);
      return;
    }

    // Determine if it's annual billing
    const isAnnual = customData.isAnnual === "true";

    // Update user document with proper error handling
    const updateData = {
      paddleSubscriptionId: subscription.id,
      paddleCustomerId: subscription.customer_id,
      subscriptionStatus: subscription.status,
      plan: "pro",
      planStartDate: subscription.started_at || new Date().toISOString(),
      subscriptionEndDate: subscription.current_billing_period?.ends_at || null,
      billingCycle: isAnnual ? "annual" : "monthly",
      promptAttempts: 100,
      isTrialActive: subscription.status === "trialing",
      trialEndsAt: subscription.trial_dates?.ends_at || null,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.update(updateData);

    // Send welcome notification
    await db.collection("notifications").add({
      userId,
      type: "subscription",
      title: "Welcome to Art Spark Pro! 🎨",
      message:
        subscription.status === "trialing"
          ? "Your 7-day trial has started. Enjoy unlimited creativity!"
          : "Your Pro subscription is now active. Create amazing art!",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Subscription created successfully for user:", userId);
  } catch (error) {
    logger.error("Error handling subscription.created:", error);
    throw error;
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    logger.info("Processing subscription.updated:", subscription.id);

    const usersQuery = await db
      .collection("users")
      .where("paddleSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      logger.error("User not found for subscription:", subscription.id);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Update subscription details
    const updates = {
      subscriptionStatus: subscription.status,
      subscriptionEndDate: subscription.current_billing_period?.ends_at || null,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle status changes
    if (
      subscription.status === "active" &&
      userData.subscriptionStatus !== "active"
    ) {
      updates.plan = "pro";
      updates.promptAttempts = 100;
      updates.isTrialActive = false;

      await db.collection("notifications").add({
        userId,
        type: "subscription",
        title: "Subscription Activated! 🎉",
        message: "Your Pro subscription is now active. Keep creating!",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (subscription.status === "past_due") {
      await db.collection("notifications").add({
        userId,
        type: "billing",
        title: "Payment Issue ⚠️",
        message:
          "We couldn't process your payment. Please update your billing information.",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await userDoc.ref.update(updates);
    logger.info("Subscription updated successfully for user:", userId);
  } catch (error) {
    logger.error("Error handling subscription.updated:", error);
    throw error;
  }
}

// Helper function to get user subscription status - FIXED
exports.getUserSubscriptionStatus = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      const auth = requireAuth(request, "getUserSubscriptionStatus");
      const userId = auth.uid;

      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const userData = userDoc.data();

      return {
        success: true,
        subscription: {
          status: userData.subscriptionStatus || "free",
          plan: userData.plan || "free",
          paddleSubscriptionId: userData.paddleSubscriptionId || null,
          subscriptionEndDate: userData.subscriptionEndDate || null,
          isTrialActive: userData.isTrialActive || false,
          trialEndsAt: userData.trialEndsAt || null,
          billingCycle: userData.billingCycle || null,
          promptAttempts: userData.promptAttempts || 5,
          extraPromptAttempts: userData.extraPromptAttempts || 0
        }
      };
    } catch (error) {
      logger.error("Error getting subscription status:", error);

      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to get subscription status");
    }
  }
);

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription) {
  try {
    logger.info("Processing subscription.canceled:", subscription.id);

    const usersQuery = await db
      .collection("users")
      .where("paddleSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      logger.error("User not found for subscription:", subscription.id);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    // Update user to free plan (but keep Pro features until period ends if applicable)
    const updates = {
      subscriptionStatus: "canceled",
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // If subscription ended immediately, downgrade now
    if (
      subscription.canceled_at &&
      new Date(subscription.canceled_at) <= new Date()
    ) {
      updates.plan = "free";
      updates.promptAttempts = 5;
      updates.paddleSubscriptionId = null;
    }

    await userDoc.ref.update(updates);

    // Send cancellation notification
    await db.collection("notifications").add({
      userId,
      type: "subscription",
      title: "Subscription Canceled",
      message:
        subscription.canceled_at &&
        new Date(subscription.canceled_at) <= new Date()
          ? "Your Pro subscription has ended. Thanks for being a Pro user!"
          : "Your subscription will end at the current billing period. You can reactivate anytime.",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Subscription canceled successfully for user:", userId);
  } catch (error) {
    logger.error("Error handling subscription.canceled:", error);
    throw error;
  }
}

// Handle subscription paused
async function handleSubscriptionPaused(subscription) {
  try {
    logger.info("Processing subscription.paused:", subscription.id);

    const usersQuery = await db
      .collection("users")
      .where("paddleSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      logger.error("User not found for subscription:", subscription.id);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    await userDoc.ref.update({
      subscriptionStatus: "paused",
      plan: "free", // Downgrade during pause
      promptAttempts: 5,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("notifications").add({
      userId,
      type: "subscription",
      title: "Subscription Paused",
      message:
        "Your Pro subscription is paused. Resume anytime to continue enjoying Pro features.",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Subscription paused successfully for user:", userId);
  } catch (error) {
    logger.error("Error handling subscription.paused:", error);
    throw error;
  }
}

// Handle subscription resumed
async function handleSubscriptionResumed(subscription) {
  try {
    logger.info("Processing subscription.resumed:", subscription.id);

    const usersQuery = await db
      .collection("users")
      .where("paddleSubscriptionId", "==", subscription.id)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      logger.error("User not found for subscription:", subscription.id);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;

    await userDoc.ref.update({
      subscriptionStatus: "active",
      plan: "pro",
      promptAttempts: 100,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection("notifications").add({
      userId,
      type: "subscription",
      title: "Welcome Back! 🎨",
      message:
        "Your Pro subscription has been resumed. Continue creating amazing art!",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Subscription resumed successfully for user:", userId);
  } catch (error) {
    logger.error("Error handling subscription.resumed:", error);
    throw error;
  }
}

// Handle transaction completed (for one-time purchases)
async function handleTransactionCompleted(transaction) {
  try {
    logger.info("Processing transaction.completed:", transaction.id);

    const customData = transaction.custom_data || {};
    const userId = customData.userId;

    if (!userId) {
      logger.error("No userId found in transaction custom_data");
      return;
    }

    // Handle different types of one-time purchases
    for (const item of transaction.items) {
      if (item.price.description.includes("Prompt Attempts")) {
        // Handle extra prompt attempts purchase
        const attemptsToAdd =
          parseInt(item.price.description.match(/\d+/)[0]) || 20;

        await db
          .collection("users")
          .doc(userId)
          .update({
            extraPromptAttempts:
              admin.firestore.FieldValue.increment(attemptsToAdd)
          });

        await db.collection("notifications").add({
          userId,
          type: "purchase",
          title: "Purchase Complete! ✨",
          message: `Added ${attemptsToAdd} extra prompt attempts to your account.`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else if (item.price.description.includes("Custom Frame")) {
        // Handle custom frame purchase
        const frameId = customData.frameId || "default";

        await db
          .collection("users")
          .doc(userId)
          .update({
            customFrames: admin.firestore.FieldValue.arrayUnion(frameId)
          });

        await db.collection("notifications").add({
          userId,
          type: "purchase",
          title: "New Frame Unlocked! 🖼️",
          message: "Your custom frame has been added to your collection.",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    logger.info("Transaction completed successfully for user:", userId);
  } catch (error) {
    logger.error("Error handling transaction.completed:", error);
    throw error;
  }
}

// Handle transaction updated
async function handleTransactionUpdated(transaction) {
  try {
    logger.info("Processing transaction.updated:", transaction.id);

    // Handle refunds or transaction status changes
    if (transaction.status === "refunded") {
      const customData = transaction.custom_data || {};
      const userId = customData.userId;

      if (userId) {
        await db.collection("notifications").add({
          userId,
          type: "billing",
          title: "Refund Processed",
          message: "Your refund has been processed successfully.",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    logger.info("Transaction updated successfully");
  } catch (error) {
    logger.error("Error handling transaction.updated:", error);
    throw error;
  }
}

// Handle customer created
async function handleCustomerCreated(customer) {
  try {
    logger.info("Processing customer.created:", customer.id);

    // This is mainly for logging and analytics
    // The actual user linking happens in subscription events

    logger.info("Customer created successfully:", customer.id);
  } catch (error) {
    logger.error("Error handling customer.created:", error);
    throw error;
  }
}

// Helper function to get user subscription status (callable function)
exports.getUserSubscriptionStatus = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      const auth = requireAuth(request, "getUserSubscriptionStatus");
      const userId = auth.uid;

      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const userData = userDoc.data();

      return {
        success: true,
        subscription: {
          status: userData.subscriptionStatus || "free",
          plan: userData.plan || "free",
          paddleSubscriptionId: userData.paddleSubscriptionId || null,
          subscriptionEndDate: userData.subscriptionEndDate || null,
          isTrialActive: userData.isTrialActive || false,
          trialEndsAt: userData.trialEndsAt || null,
          billingCycle: userData.billingCycle || null,
          promptAttempts: userData.promptAttempts || 5,
          extraPromptAttempts: userData.extraPromptAttempts || 0
        }
      };
    } catch (error) {
      logger.error("Error getting subscription status:", error);

      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to get subscription status");
    }
  }
);

// Helper function to cancel subscription (callable function)
exports.cancelSubscription = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      const auth = requireAuth(request, "cancelSubscription");
      const userId = auth.uid;

      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const userData = userDoc.data();
      const subscriptionId = userData.paddleSubscriptionId;

      if (!subscriptionId) {
        throw new HttpsError(
          "failed-precondition",
          "No active subscription found"
        );
      }

      // Note: In a production environment, you might want to call Paddle's API
      // to cancel the subscription programmatically, but usually it's better
      // to let users cancel through Paddle's customer portal

      return {
        success: true,
        message: "Please use the billing portal to manage your subscription",
        subscriptionId
      };
    } catch (error) {
      logger.error("Error canceling subscription:", error);

      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to cancel subscription");
    }
  }
);

// Challenge generator
function generateHybridChallenge(date) {
  const dateStr = date.toISOString().split("T")[0];
  const monthDay = dateStr.substring(5);
  const special = curatedChallenges.find(
    (c) => c.special && c.occasions.includes(monthDay)
  );
  if (special) return special;

  const seed = dateStr
    .split("-")
    .reduce((acc, part) => acc + parseInt(part), 0);
  const useCurated = seed % 4 < 3;

  if (useCurated) {
    const regular = curatedChallenges.filter((c) => !c.special);
    return regular[seed % regular.length];
  }

  const getRandom = (arr, offset = 0) => arr[(seed + offset * 7) % arr.length];
  const theme = getRandom(challengeElements.themes, 1);
  const subject = getRandom(challengeElements.subjects, 2);
  const style = getRandom(challengeElements.styles, 3);
  const action = getRandom(challengeElements.actions, 5);
  const element = getRandom(challengeElements.elements, 6);

  return {
    title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} ${
      subject.charAt(0).toUpperCase() + subject.slice(1)
    }`,
    task: `Create a ${style} ${theme} ${subject} that is ${action} with ${element}`,
    generated: true
  };
}

// Helper function to check if user is authenticated
function requireAuth(context, functionName) {
  if (!context.auth) {
    logger.warn(`Unauthorized attempt to call ${functionName}`);
    throw new HttpsError(
      "unauthenticated",
      "Authentication required to access this function."
    );
  }
  return context.auth;
}

// Helper function to check admin privileges (optional)
async function checkAdminPrivileges(uid) {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    return userData?.isAdmin === true;
  } catch (error) {
    logger.warn(`Error checking admin status for user ${uid}:`, error);
    return false;
  }
}

// Scheduled function (midnight UTC)
exports.createDailyChallenge = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "UTC"
  },
  async (context) => {
    try {
      logger.info("🕛 Scheduled daily challenge creation started");

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      logger.info(`📅 Processing date: ${dateStr}`);

      const docRef = db.collection("dailyChallenges").doc(dateStr);
      const existing = await docRef.get();

      if (existing.exists) {
        logger.info(`⚠️ Challenge already exists for ${dateStr}`);
        return;
      }

      const challenge = generateHybridChallenge(today);
      const data = {
        id: dateStr,
        title: challenge.title,
        task: challenge.task,
        date: admin.firestore.Timestamp.fromDate(today),
        createdAt: admin.firestore.Timestamp.now(),
        type: challenge.special
          ? "special"
          : challenge.generated
          ? "dynamic"
          : "curated"
      };

      await docRef.set(data);
      logger.info(`✅ Created ${data.type} daily challenge: ${data.title}`);
    } catch (error) {
      logger.error("❌ Error in scheduled challenge creation:", error);
      throw error;
    }
  }
);

exports.sendContactMessage = onCall(async (req) => {
  const { name, email, message } = req.data;

  if (!name || !email || !message) {
    throw new HttpsError("invalid-argument", "All fields are required.");
  }

  try {
    const docRef = await db.collection("contactMessages").add({
      name,
      email,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error("Error saving contact message:", error);
    throw new HttpsError("internal", "Failed to send message.");
  }
});

// Manual challenge creation (authenticated users only)
exports.createDailyChallengeManual = onCall(
  {
    enforceAppCheck: false // Set to true if using App Check
  },
  async (request) => {
    logger.info("🟢 Manual challenge creation triggered");

    try {
      // Require authentication
      const auth = requireAuth(request, "createDailyChallengeManual");
      logger.info(`✅ Authenticated user: ${auth.uid}`);

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      logger.info(`📅 Today's date (UTC): ${dateStr}`);

      const docRef = db.collection("dailyChallenges").doc(dateStr);
      const existing = await docRef.get();

      if (existing.exists) {
        logger.warn(`⚠️ Challenge already exists for ${dateStr}`);
        return {
          status: "exists",
          message: `Challenge already exists for ${dateStr}`,
          challenge: existing.data()
        };
      }

      logger.info("🚀 Generating new challenge...");
      const challenge = generateHybridChallenge(today);
      logger.debug("Generated challenge object:", challenge);

      const challengeData = {
        id: dateStr,
        title: challenge.title,
        task: challenge.task,
        date: admin.firestore.Timestamp.fromDate(today),
        createdAt: admin.firestore.Timestamp.now(),
        type: challenge.special
          ? "special"
          : challenge.generated
          ? "dynamic"
          : "curated",
        createdBy: auth.uid
      };

      logger.info(
        `📝 Prepared challenge data: ${JSON.stringify(challengeData)}`
      );

      await docRef.set(challengeData);
      logger.info(
        `✅ Successfully created ${challengeData.type} challenge: ${challengeData.title}`
      );

      return {
        status: "created",
        type: challengeData.type,
        title: challengeData.title,
        challenge: challengeData
      };
    } catch (error) {
      logger.error("❌ Failed to create daily challenge:", error);

      // Re-throw HttpsError as-is, wrap other errors
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to create daily challenge.");
    }
  }
);

// Manually add challenge (authenticated users only)
exports.addChallenge = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    logger.info("📝 Manual challenge addition triggered");

    try {
      const auth = requireAuth(request, "addChallenge");
      const { title, task, date } = request.data;

      // Validate input
      if (!title || !task) {
        throw new HttpsError(
          "invalid-argument",
          "Title and task are required."
        );
      }

      const challengeDate = date ? new Date(date) : new Date();
      const dateStr = challengeDate.toISOString().split("T")[0];

      logger.info(`📅 Adding challenge for date: ${dateStr}`);

      const challengeData = {
        id: dateStr,
        title: title.trim(),
        task: task.trim(),
        date: admin.firestore.Timestamp.fromDate(challengeDate),
        createdAt: admin.firestore.Timestamp.now(),
        type: "manual",
        createdBy: auth.uid
      };

      await db.collection("dailyChallenges").doc(dateStr).set(challengeData);

      logger.info(
        `✅ Successfully added manual challenge: ${challengeData.title}`
      );
      return {
        success: true,
        challenge: challengeData
      };
    } catch (error) {
      logger.error("❌ Error creating manual challenge:", error);

      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to create challenge");
    }
  }
);

// Get today's challenge (public function - no auth required)
exports.getTodaysChallenge = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      logger.info(`🔍 Retrieving challenge for: ${dateStr}`);

      const doc = await db.collection("dailyChallenges").doc(dateStr).get();

      if (!doc.exists) {
        logger.info(`📭 No challenge found for ${dateStr}`);
        return {
          exists: false,
          message: "No challenge found for today"
        };
      }

      const challengeData = doc.data();
      logger.info(`✅ Retrieved challenge: ${challengeData.title}`);

      return {
        exists: true,
        challenge: challengeData
      };
    } catch (error) {
      logger.error("❌ Error retrieving today's challenge:", error);
      throw new HttpsError("internal", "Failed to get challenge");
    }
  }
);

// Get challenge by date (public function - no auth required)
exports.getChallengeByDate = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      const { date } = request.data;

      if (!date) {
        throw new HttpsError("invalid-argument", "Date parameter is required");
      }

      const challengeDate = new Date(date);
      const dateStr = challengeDate.toISOString().split("T")[0];

      logger.info(`🔍 Retrieving challenge for: ${dateStr}`);

      const doc = await db.collection("dailyChallenges").doc(dateStr).get();

      if (!doc.exists) {
        logger.info(`📭 No challenge found for ${dateStr}`);
        return {
          exists: false,
          message: `No challenge found for ${dateStr}`
        };
      }

      const challengeData = doc.data();
      logger.info(`✅ Retrieved challenge: ${challengeData.title}`);

      return {
        exists: true,
        challenge: challengeData
      };
    } catch (error) {
      logger.error("❌ Error retrieving challenge by date:", error);

      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to get challenge");
    }
  }
);

// Get recent challenges (public function - no auth required)
exports.getRecentChallenges = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      const { limit = 7 } = request.data || {};

      logger.info(`🔍 Retrieving last ${limit} challenges`);

      const snapshot = await db
        .collection("dailyChallenges")
        .orderBy("date", "desc")
        .limit(Math.min(limit, 30)) // Cap at 30 for performance
        .get();

      const challenges = [];
      snapshot.forEach((doc) => {
        challenges.push(doc.data());
      });

      logger.info(`✅ Retrieved ${challenges.length} challenges`);

      return {
        success: true,
        challenges,
        count: challenges.length
      };
    } catch (error) {
      logger.error("❌ Error retrieving recent challenges:", error);
      throw new HttpsError("internal", "Failed to get recent challenges");
    }
  }
);

exports.trackGenerationAttempt = onCall(async (request) => {
  const context = request.auth;
  const data = request.data;

  if (!context) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { challengeId } = data;
  const userId = context.uid;

  try {
    const userChallengeRef = db.doc(`userChallenges/${userId}_${challengeId}`);
    const userChallengeDoc = await userChallengeRef.get();

    const userDoc = await db.doc(`users/${userId}`).get();
    const isPro = userDoc.data()?.isPro;
    const maxAttempts = isPro ? 15 : 5;

    if (userChallengeDoc.exists) {
      const currentAttempts = userChallengeDoc.data().attemptsUsed || 0;
      if (currentAttempts >= maxAttempts) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "Maximum attempts reached"
        );
      }
      await userChallengeRef.update({
        attemptsUsed: admin.firestore.FieldValue.increment(1),
        lastAttemptAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await userChallengeRef.set({
        userId,
        challengeId,
        attemptsUsed: 1,
        hasSubmitted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAttemptAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error tracking generation attempt:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.toggleSubmissionLike = onCall(async (request) => {
  const context = request.auth;
  const data = request.data;

  if (!context) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { submissionId } = data;
  const userId = context.uid;

  try {
    const submissionRef = db.doc(`submissions/${submissionId}`);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Submission not found");
    }

    const submission = submissionDoc.data();
    const likes = submission.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await submissionRef.update({
        likes: admin.firestore.FieldValue.arrayRemove(userId),
        likesCount: admin.firestore.FieldValue.increment(-1)
      });
      await db.doc(`users/${submission.userId}`).update({
        totalLikes: admin.firestore.FieldValue.increment(-1)
      });
    } else {
      await submissionRef.update({
        likes: admin.firestore.FieldValue.arrayUnion(userId),
        likesCount: admin.firestore.FieldValue.increment(1)
      });
      await db.doc(`users/${submission.userId}`).update({
        totalLikes: admin.firestore.FieldValue.increment(1)
      });

      if (userId !== submission.userId) {
        const likerDoc = await db.doc(`users/${userId}`).get();
        const likerName = likerDoc.data()?.displayName || "Someone";

        await db.collection("notifications").add({
          userId: submission.userId,
          type: "like",
          title: "New Like!",
          message: `${likerName} liked your submission`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          relatedSubmissionId: submissionId,
          relatedUserId: userId
        });
      }

      if ((submission.likesCount || 0) + 1 >= 100) {
        await checkAndAwardAchievement(submission.userId, "crowd_favorite", {
          submissionId
        });
      }
    }

    return { liked: !hasLiked };
  } catch (error) {
    console.error("Error toggling like:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.addSubmissionComment = onCall(async (request) => {
  const context = request.auth;
  const data = request.data;

  if (!context) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { submissionId, text } = data;
  const userId = context.uid;

  if (!text?.trim()) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Comment text is required"
    );
  }

  if (text.length > 500) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Comment too long"
    );
  }

  try {
    const userDoc = await db.doc(`users/${userId}`).get();
    const userData = userDoc.data();
    const commentId =
      Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9);

    const comment = {
      id: commentId, // Use the generated ID
      userId,
      userDisplayName: userData.displayName || "Anonymous",
      userPhotoURL: userData.photoURL || null,
      text: text.trim(),
      createdAt: admin.firestore.Timestamp.now()
    };

    const submissionRef = db.doc(`submissions/${submissionId}`);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Submission not found");
    }

    const submission = submissionDoc.data();

    await submissionRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(comment),
      commentsCount: admin.firestore.FieldValue.increment(1)
    });

    await db.doc(`users/${userId}`).update({
      totalComments: admin.firestore.FieldValue.increment(1)
    });

    if (userId !== submission.userId) {
      await db.collection("notifications").add({
        userId: submission.userId,
        type: "comment",
        title: "New Comment!",
        message: `${
          userData.displayName || "Someone"
        } commented on your submission`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        relatedSubmissionId: submissionId,
        relatedUserId: userId
      });
    }

    const userTotalComments = (userData.totalComments || 0) + 1;
    if (userTotalComments >= 50) {
      await checkAndAwardAchievement(userId, "critic", {
        count: userTotalComments
      });
    }

    return { success: true, comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new functions.https.HttpsError("internal", error.message, error);
  }
});

exports.cleanupGeneratedImages = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "UTC"
  },
  async () => {
    try {
      logger.info("🧹 Starting cleanup of non-submitted generated images");

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const imagesQuery = await db
        .collection("generatedImages")
        .where("isSubmitted", "==", false)
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(yesterday))
        .get();

      const deletePromises = imagesQuery.docs.map(async (doc) => {
        const imageData = doc.data();
        try {
          const fileRef = storage
            .bucket()
            .file(imageData.imageUrl.split("/o/")[1].split("?")[0]);
          await fileRef.delete();
          await doc.ref.delete();
          logger.info(`Deleted non-submitted image: ${imageData.imageUrl}`);
        } catch (err) {
          logger.error(`Error deleting image ${imageData.imageUrl}:`, err);
        }
      });

      await Promise.all(deletePromises);
      logger.info("✅ Completed cleanup of non-submitted images");
    } catch (error) {
      logger.error("❌ Error in cleanupGeneratedImages:", error);
      throw error;
    }
  }
);

exports.determineDailyWinner = onSchedule(
  {
    schedule: "0 1 * * *",
    timeZone: "UTC"
  },
  async () => {
    await determineDailyWinnerInternal();
  }
);

exports.runDetermineDailyWinnerManual = onCall(async (request) => {
  return await determineDailyWinnerInternal(true);
});

async function determineDailyWinnerInternal(manual = false) {
  try {
    console.log(
      `[${manual ? "Manual" : "Scheduled"}] Starting determineDailyWinner`
    );

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    const dateString = startOfYesterday.toISOString().split("T")[0];
    console.log(`Targeting date: ${dateString}`);

    let challengeSnapshot;
    try {
      console.log("Querying dailyChallenges...");
      const challengesQuery = db
        .collection("dailyChallenges")
        .where(
          "date",
          ">=",
          admin.firestore.Timestamp.fromDate(startOfYesterday)
        )
        .where("date", "<", admin.firestore.Timestamp.fromDate(endOfYesterday))
        .limit(1);

      challengeSnapshot = await challengesQuery.get();
    } catch (err) {
      console.error("Error querying dailyChallenges:", err);
      throw err;
    }

    if (challengeSnapshot.empty) {
      console.log("No daily challenge found for yesterday.");
      return;
    }

    const challenge = challengeSnapshot.docs[0];
    const challengeId = challenge.id;
    console.log(`Found challenge ID: ${challengeId}`);

    let submissionsSnapshot;
    try {
      console.log("Querying submissions for challenge...");
      const submissionsQuery = db
        .collection("submissions")
        .where("challengeId", "==", challengeId)
        .orderBy("likesCount", "desc")
        .orderBy("createdAt", "asc");

      submissionsSnapshot = await submissionsQuery.get();
    } catch (err) {
      console.error("Error querying submissions:", err);
      throw err;
    }

    if (submissionsSnapshot.empty) {
      console.log("No submissions found for this challenge.");
      return;
    }

    const winnerDoc = submissionsSnapshot.docs[0];
    const winner = winnerDoc.data();
    console.log(
      `Top submission found: ${winner.userDisplayName} with ${winner.likesCount} likes`
    );

    try {
      await db.doc(`dailyWinners/${dateString}`).set({
        date: dateString,
        challengeId,
        submissionId: winnerDoc.id,
        userId: winner.userId,
        userDisplayName: winner.userDisplayName,
        likesCount: winner.likesCount,
        submissionCreatedAt: winner.createdAt,
        determinedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("Winner document written to dailyWinners.");
    } catch (err) {
      console.error("Error writing to dailyWinners:", err);
      throw err;
    }

    try {
      await winnerDoc.ref.update({
        winnerId: winner.userId,
        wonAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("Winner submission updated with winnerId.");
    } catch (err) {
      console.error("Error updating winning submission:", err);
    }

    try {
      await db.collection("notifications").add({
        userId: winner.userId,
        type: "winner",
        title: "Congratulations! 🎉",
        message: `You won yesterday's challenge with ${winner.likesCount} likes!`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        relatedSubmissionId: winnerDoc.id,
        relatedChallengeId: challengeId
      });
      console.log("Notification sent to winner.");
    } catch (err) {
      console.error("Error creating winner notification:", err);
    }

    console.log(
      `✅ Daily winner determined: ${winner.userDisplayName} (${winner.userId})`
    );

    return { status: "success", winner: winner.userDisplayName };
  } catch (error) {
    console.error("❌ Unexpected error in determineDailyWinner:", error);
    return { status: "error", error: error.message || error.toString() };
  }
}

// 5. Helper function to check and award achievements
async function checkAndAwardAchievement(userId, achievementId, metadata = {}) {
  try {
    const achievementsRef = db.collection(`users/${userId}/achievements`);
    const querySnapshot = await achievementsRef
      .where("id", "==", achievementId)
      .get();

    if (!querySnapshot.empty) {
      console.log(
        `Achievement ${achievementId} already awarded for user ${userId}`
      );
      return; // Achievement already awarded
    }

    const achievementData = getAchievementData(achievementId);
    if (!achievementData) {
      console.error(`Invalid achievementId: ${achievementId}`);
      return;
    }

    const achievementRef = achievementsRef.doc(); // Use a random ID
    await achievementRef.set({
      ...achievementData,
      unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata
    });

    await db.doc(`users/${userId}`).update({
      achievementsCount: admin.firestore.FieldValue.increment(1)
    });

    await db.collection("notifications").add({
      userId,
      type: "achievement",
      title: "Achievement Unlocked! 🏆",
      message: `You earned "${achievementData.name}"`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      relatedAchievementId: achievementId
    });

    console.log(`Achievement awarded: ${achievementId} to user ${userId}`);
  } catch (error) {
    console.error("Error awarding achievement:", error);
    throw error;
  }
}

// Achievement definitions
function getAchievementData(achievementId) {
  const achievements = {
    first_spark: {
      id: "first_spark",
      name: "First Spark",
      description: "Made your first submission",
      icon: "✨",
      type: "submission"
    },
    weekly_streak: {
      id: "weekly_streak",
      name: "Weekly Streak",
      description: "7 consecutive days of submissions",
      icon: "🔥",
      type: "streak"
    },
    crowd_favorite: {
      id: "crowd_favorite",
      name: "Crowd Favorite",
      description: "Received 100 likes on a submission",
      icon: "👑",
      type: "engagement"
    },
    critic: {
      id: "critic",
      name: "Art Critic",
      description: "Left 50 comments on submissions",
      icon: "💬",
      type: "engagement"
    },
    innovator: {
      id: "innovator",
      name: "Innovator",
      description: "Consistently high variety in prompt usage",
      icon: "🚀",
      type: "special"
    }
  };

  return achievements[achievementId] || null;
}
