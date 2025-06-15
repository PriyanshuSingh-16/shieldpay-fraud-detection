import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { qrAnalysisService } from "./services/qrAnalysis";
import { transactionAnalysisService } from "./services/transactionAnalysis";
import { insertTransactionSchema, insertQRCodeSchema, insertAlertSchema, insertFlaggedAccountSchema } from "@shared/schema";
import { User } from "@shared/schema";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const user = await authService.verifyToken(token);
  if (!user) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const result = await authService.login(username, password);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.body;
      const user = await authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Token verification failed" });
    }
  });

  // QR Code analysis routes
  app.post("/api/upload-qr", authenticateToken, upload.single('qrImage'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const analysis = await qrAnalysisService.analyzeQRCode(req.file.buffer, req.file.originalname);
      
      // Store QR code analysis result
      const qrCode = await storage.createQRCode({
        filename: req.file.originalname,
        upiId: analysis.upiId,
        merchantName: analysis.merchantName,
        amount: analysis.amount?.toString(),
        riskScore: analysis.riskScore,
        steganographyDetected: analysis.steganographyDetected,
        classification: analysis.classification,
        confidence: analysis.confidence.toString(),
        metadata: { details: analysis.details }
      });

      // Create alert if high risk
      if (analysis.riskScore > 80) {
        await storage.createAlert({
          type: 'qr-steganography',
          severity: 'critical',
          title: 'Steganographic QR Code Detected',
          description: `Hidden payload found in QR code from ${analysis.upiId}`,
          accountId: analysis.upiId,
          riskScore: analysis.riskScore,
          metadata: { qrCodeId: qrCode.id }
        });
      }

      res.json({
        success: true,
        analysis,
        qrCodeId: qrCode.id
      });
    } catch (error) {
      res.status(500).json({ message: "QR code analysis failed" });
    }
  });

  app.get("/api/qr-codes", authenticateToken, async (req, res) => {
    try {
      const qrCodes = await storage.getQRCodes();
      res.json(qrCodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  // Transaction analysis routes
  app.post("/api/analyze-transactions", authenticateToken, upload.single('transactionFile'), async (req, res) => {
    try {
      let transactions = [];

      if (req.file) {
        // Parse uploaded file (CSV or JSON)
        const fileContent = req.file.buffer.toString();
        
        if (req.file.mimetype === 'application/json') {
          transactions = JSON.parse(fileContent);
        } else {
          // Simple CSV parsing for demo
          const lines = fileContent.split('\n').slice(1); // Skip header
          transactions = lines.map(line => {
            const [senderId, receiverId, amount, timestamp, deviceId, geoIp] = line.split(',');
            return { senderId, receiverId, amount, timestamp, deviceId, geoIp };
          }).filter(tx => tx.senderId); // Filter out empty lines
        }

        // Store transactions
        for (const tx of transactions) {
          await storage.createTransaction({
            senderId: tx.senderId,
            receiverId: tx.receiverId,
            amount: tx.amount,
            deviceId: tx.deviceId,
            geoIp: tx.geoIp,
            riskScore: 0,
            metadata: {}
          });
        }
      }

      // Get all transactions for analysis
      const allTransactions = await storage.getTransactions();
      const analysisResult = transactionAnalysisService.analyzeTransactions(allTransactions);

      // Create alerts for high-risk transactions
      for (const flagged of analysisResult.flaggedTransactions) {
        if (flagged.riskScore > 80) {
          await storage.createAlert({
            type: 'transaction-fraud',
            severity: 'high',
            title: `${flagged.pattern} Pattern Detected`,
            description: flagged.description,
            accountId: `transaction-${flagged.id}`,
            riskScore: flagged.riskScore,
            metadata: { transactionId: flagged.id }
          });
        }
      }

      res.json({
        success: true,
        analysis: analysisResult
      });
    } catch (error) {
      res.status(500).json({ message: "Transaction analysis failed" });
    }
  });

  app.get("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Account flagging routes
  app.post("/api/flag-account", authenticateToken, async (req, res) => {
    try {
      const { accountId, flagReason, riskScore } = req.body;
      
      if (!accountId || !flagReason || !riskScore) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const flaggedAccount = await storage.createFlaggedAccount({
        accountId,
        flagReason,
        riskScore,
        status: 'pending',
        metadata: {}
      });

      // Create alert for flagged account
      await storage.createAlert({
        type: 'account-flagged',
        severity: riskScore > 80 ? 'critical' : 'high',
        title: 'Account Flagged',
        description: `Account ${accountId} flagged for ${flagReason}`,
        accountId,
        riskScore,
        metadata: { flaggedAccountId: flaggedAccount.id }
      });

      res.json({
        success: true,
        flaggedAccount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to flag account" });
    }
  });

  app.get("/api/flagged-accounts", authenticateToken, async (req, res) => {
    try {
      const flaggedAccounts = await storage.getFlaggedAccounts();
      res.json(flaggedAccounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flagged accounts" });
    }
  });

  app.patch("/api/flagged-accounts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedAccount = await storage.updateFlaggedAccountStatus(
        parseInt(id), 
        status, 
        req.user.username
      );
      
      if (!updatedAccount) {
        return res.status(404).json({ message: "Flagged account not found" });
      }

      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to update flagged account" });
    }
  });

  // Alert management routes
  app.get("/api/admin/alerts", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/active", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active alerts" });
    }
  });

  app.patch("/api/alerts/:id/acknowledge", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.acknowledgeAlert(parseInt(id));
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const qrCodes = await storage.getQRCodes();
      const alerts = await storage.getActiveAlerts();
      const flaggedAccounts = await storage.getFlaggedAccounts();

      const suspiciousTransactions = transactions.filter(tx => (tx.riskScore || 0) > 40);
      const highRiskTransactions = transactions.filter(tx => (tx.riskScore || 0) > 80);

      const stats = {
        totalTransactions: transactions.length,
        suspiciousCount: suspiciousTransactions.length,
        highRiskCount: highRiskTransactions.length,
        qrScanned: qrCodes.length,
        activeAlerts: alerts.length,
        flaggedAccounts: flaggedAccounts.filter(acc => acc.status === 'pending').length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
