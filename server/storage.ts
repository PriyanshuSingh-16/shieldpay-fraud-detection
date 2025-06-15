import {
  users, transactions, qrCodes, alerts, flaggedAccounts,
  type User, type InsertUser, type Transaction, type InsertTransaction,
  type QRCode, type InsertQRCode, type Alert, type InsertAlert,
  type FlaggedAccount, type InsertFlaggedAccount
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTransactions(): Promise<Transaction[]>;
  getTransactionsByPattern(pattern: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionRisk(id: number, riskScore: number, patternType?: string): Promise<Transaction | undefined>;
  flagTransaction(id: number): Promise<Transaction | undefined>;

  getQRCodes(): Promise<QRCode[]>;
  createQRCode(qrCode: InsertQRCode): Promise<QRCode>;
  getQRCodeById(id: number): Promise<QRCode | undefined>;

  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;

  getFlaggedAccounts(): Promise<FlaggedAccount[]>;
  createFlaggedAccount(account: InsertFlaggedAccount): Promise<FlaggedAccount>;
  updateFlaggedAccountStatus(id: number, status: string, reviewedBy?: string): Promise<FlaggedAccount | undefined>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private transactions = new Map<number, Transaction>();
  private qrCodes = new Map<number, QRCode>();
  private alerts = new Map<number, Alert>();
  private flaggedAccounts = new Map<number, FlaggedAccount>();
  private currentUserId = 1;
  private currentTransactionId = 1;
  private currentQRId = 1;
  private currentAlertId = 1;
  private currentFlaggedId = 1;

  constructor() {
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
      flagged: false,
      riskScore: insertTransaction.riskScore !== undefined ? insertTransaction.riskScore : null,
      patternType: insertTransaction.patternType !== undefined ? insertTransaction.patternType : null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionRisk(id: number, riskScore: number, patternType?: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.riskScore = riskScore;
      if (patternType !== undefined) transaction.patternType = patternType;
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
      scannedAt: new Date(),
      metadata: insertQRCode.metadata !== undefined ? insertQRCode.metadata : {},
      riskScore: insertQRCode.riskScore !== undefined ? insertQRCode.riskScore : null,
      patternType: insertQRCode.patternType !== undefined ? insertQRCode.patternType : null
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
      acknowledged: false,
      riskScore: insertAlert.riskScore !== undefined ? insertAlert.riskScore : null,
      metadata: insertAlert.metadata !== undefined ? insertAlert.metadata : {},
      status: insertAlert.status !== undefined ? insertAlert.status : null,
      accountId: insertAlert.accountId !== undefined ? insertAlert.accountId : null
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
      reviewedBy: null,
      metadata: insertFlaggedAccount.metadata !== undefined ? insertFlaggedAccount.metadata : {},
      status: insertFlaggedAccount.status !== undefined ? insertFlaggedAccount.status : null
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
