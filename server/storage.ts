import { 
  users, transactions, qrCodes, alerts, flaggedAccounts,
  type User, type InsertUser, type Transaction, type InsertTransaction,
  type QRCode, type InsertQRCode, type Alert, type InsertAlert,
  type FlaggedAccount, type InsertFlaggedAccount
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByPattern(pattern: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionRisk(id: number, riskScore: number, patternType?: string): Promise<Transaction | undefined>;
  flagTransaction(id: number): Promise<Transaction | undefined>;

  // QR Code operations
  getQRCodes(): Promise<QRCode[]>;
  createQRCode(qrCode: InsertQRCode): Promise<QRCode>;
  getQRCodeById(id: number): Promise<QRCode | undefined>;

  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;

  // Flagged Account operations
  getFlaggedAccounts(): Promise<FlaggedAccount[]>;
  createFlaggedAccount(account: InsertFlaggedAccount): Promise<FlaggedAccount>;
  updateFlaggedAccountStatus(id: number, status: string, reviewedBy?: string): Promise<FlaggedAccount | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private qrCodes: Map<number, QRCode>;
  private alerts: Map<number, Alert>;
  private flaggedAccounts: Map<number, FlaggedAccount>;
  private currentUserId: number;
  private currentTransactionId: number;
  private currentQRId: number;
  private currentAlertId: number;
  private currentFlaggedId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.qrCodes = new Map();
    this.alerts = new Map();
    this.flaggedAccounts = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentQRId = 1;
    this.currentAlertId = 1;
    this.currentFlaggedId = 1;

    // Initialize with admin user
    this.createUser({ username: "admin@shieldpay.com", password: "admin123" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: "admin",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByPattern(pattern: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(tx => tx.patternType === pattern);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      timestamp: new Date(),
      flagged: false
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionRisk(id: number, riskScore: number, patternType?: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.riskScore = riskScore;
      if (patternType) transaction.patternType = patternType;
      this.transactions.set(id, transaction);
      return transaction;
    }
    return undefined;
  }

  async flagTransaction(id: number): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.flagged = true;
      this.transactions.set(id, transaction);
      return transaction;
    }
    return undefined;
  }

  async getQRCodes(): Promise<QRCode[]> {
    return Array.from(this.qrCodes.values());
  }

  async createQRCode(insertQRCode: InsertQRCode): Promise<QRCode> {
    const id = this.currentQRId++;
    const qrCode: QRCode = {
      ...insertQRCode,
      id,
      scannedAt: new Date()
    };
    this.qrCodes.set(id, qrCode);
    return qrCode;
  }

  async getQRCodeById(id: number): Promise<QRCode | undefined> {
    return this.qrCodes.get(id);
  }

  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.status === "active");
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
      acknowledged: false
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.acknowledged = true;
      alert.status = "acknowledged";
      this.alerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  async getFlaggedAccounts(): Promise<FlaggedAccount[]> {
    return Array.from(this.flaggedAccounts.values());
  }

  async createFlaggedAccount(insertFlaggedAccount: InsertFlaggedAccount): Promise<FlaggedAccount> {
    const id = this.currentFlaggedId++;
    const flaggedAccount: FlaggedAccount = {
      ...insertFlaggedAccount,
      id,
      flaggedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null
    };
    this.flaggedAccounts.set(id, flaggedAccount);
    return flaggedAccount;
  }

  async updateFlaggedAccountStatus(id: number, status: string, reviewedBy?: string): Promise<FlaggedAccount | undefined> {
    const account = this.flaggedAccounts.get(id);
    if (account) {
      account.status = status;
      account.reviewedAt = new Date();
      if (reviewedBy) account.reviewedBy = reviewedBy;
      this.flaggedAccounts.set(id, account);
      return account;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
