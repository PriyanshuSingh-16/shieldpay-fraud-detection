import { Transaction } from '@shared/schema';

export interface TransactionAnalysisResult {
  totalAnalyzed: number;
  suspiciousCount: number;
  highRiskCount: number;
  patterns: {
    smurfing: number;
    flashLaundering: number;
    muleNetworks: number;
    circularTransfers: number;
  };
  flaggedTransactions: Array<{
    id: number;
    pattern: string;
    riskScore: number;
    description: string;
  }>;
}

export class TransactionAnalysisService {
  analyzeTransactions(transactions: Transaction[]): TransactionAnalysisResult {
    const result: TransactionAnalysisResult = {
      totalAnalyzed: transactions.length,
      suspiciousCount: 0,
      highRiskCount: 0,
      patterns: {
        smurfing: 0,
        flashLaundering: 0,
        muleNetworks: 0,
        circularTransfers: 0
      },
      flaggedTransactions: []
    };

    for (const tx of transactions) {
      const analysis = this.analyzeTransaction(tx, transactions);
      
      if (analysis.riskScore > 70) {
        result.highRiskCount++;
        result.flaggedTransactions.push({
          id: tx.id,
          pattern: analysis.pattern,
          riskScore: analysis.riskScore,
          description: analysis.description
        });
      } else if (analysis.riskScore > 40) {
        result.suspiciousCount++;
      }

      // Update pattern counts
      if (analysis.pattern === 'smurfing') result.patterns.smurfing++;
      else if (analysis.pattern === 'flash-laundering') result.patterns.flashLaundering++;
      else if (analysis.pattern === 'mule-network') result.patterns.muleNetworks++;
      else if (analysis.pattern === 'circular-transfer') result.patterns.circularTransfers++;
    }

    return result;
  }

  private analyzeTransaction(transaction: Transaction, allTransactions: Transaction[]) {
    let riskScore = 0;
    let pattern = 'normal';
    let description = 'Normal transaction pattern';

    // Check for smurfing (many small transactions from same sender)
    const senderTransactions = allTransactions.filter(tx => 
      tx.senderId === transaction.senderId && 
      Math.abs(new Date(tx.timestamp!).getTime() - new Date(transaction.timestamp!).getTime()) < 24 * 60 * 60 * 1000
    );

    if (senderTransactions.length > 10 && parseFloat(transaction.amount) < 10000) {
      riskScore += 30;
      pattern = 'smurfing';
      description = 'Multiple small transactions from same sender detected';
    }

    // Check for flash laundering (rapid transfers)
    const rapidTransfers = allTransactions.filter(tx => 
      (tx.senderId === transaction.receiverId || tx.receiverId === transaction.senderId) &&
      Math.abs(new Date(tx.timestamp!).getTime() - new Date(transaction.timestamp!).getTime()) < 60 * 60 * 1000
    );

    if (rapidTransfers.length > 3 && parseFloat(transaction.amount) > 20000) {
      riskScore += 40;
      pattern = 'flash-laundering';
      description = 'Rapid circular transfers detected';
    }

    // Check for mule networks (same device/IP multiple accounts)
    if (transaction.deviceId) {
      const deviceTransactions = allTransactions.filter(tx => 
        tx.deviceId === transaction.deviceId && tx.senderId !== transaction.senderId
      );
      
      if (deviceTransactions.length > 5) {
        riskScore += 25;
        pattern = 'mule-network';
        description = 'Multiple accounts on same device detected';
      }
    }

    // Check for unusual amounts (round numbers, specific patterns)
    const amount = parseFloat(transaction.amount);
    if (amount === 9999 || amount === 49999 || amount % 10000 === 0) {
      riskScore += 15;
      description += '. Suspicious amount pattern';
    }

    // Check for unusual timing (late night, early morning)
    const hour = new Date(transaction.timestamp!).getHours();
    if (hour < 6 || hour > 23) {
      riskScore += 10;
      description += '. Unusual timing';
    }

    return { riskScore, pattern, description };
  }

  detectSmurfingPattern(transactions: Transaction[], senderId: string): boolean {
    const senderTxs = transactions.filter(tx => tx.senderId === senderId);
    const last24Hours = senderTxs.filter(tx => 
      new Date(tx.timestamp!).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    
    return last24Hours.length > 10 && 
           last24Hours.every(tx => parseFloat(tx.amount) < 10000);
  }

  detectFlashLaundering(transactions: Transaction[]): boolean {
    // Look for rapid circular transfers
    for (const tx of transactions) {
      const relatedTxs = transactions.filter(t => 
        (t.senderId === tx.receiverId && t.receiverId === tx.senderId) &&
        Math.abs(new Date(t.timestamp!).getTime() - new Date(tx.timestamp!).getTime()) < 60 * 60 * 1000
      );
      
      if (relatedTxs.length > 0) return true;
    }
    
    return false;
  }

  detectMuleNetwork(transactions: Transaction[], deviceId: string): boolean {
    const deviceTxs = transactions.filter(tx => tx.deviceId === deviceId);
    const uniqueSenders = new Set(deviceTxs.map(tx => tx.senderId));
    
    return uniqueSenders.size > 5;
  }
}

export const transactionAnalysisService = new TransactionAnalysisService();
