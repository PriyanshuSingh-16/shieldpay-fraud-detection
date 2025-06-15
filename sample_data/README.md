# ShieldPay Sample Data for Testing

This directory contains comprehensive test data for validating the fraud detection capabilities of ShieldPay. The data includes transaction patterns and QR code samples designed to test various security scenarios.

## Transaction Data Files

### CSV Format Files
1. **transactions_normal.csv** - Clean transaction data
   - 12 legitimate transactions
   - Normal business patterns
   - Expected: Low risk scores

2. **transactions_suspicious.csv** - Suspicious patterns
   - Smurfing attempts (multiple 9999 amounts)
   - Circular transfers
   - Expected: Medium-high risk scores

3. **transactions_flash_laundering.csv** - Flash laundering patterns
   - Rapid circular transfers
   - High-value quick movements
   - Expected: High risk scores for flash laundering detection

4. **transactions_mule_network.csv** - Mule network patterns
   - Single controller distributing to multiple accounts
   - Same device ID for multiple accounts
   - Expected: Mule network pattern detection

### JSON Format Files
5. **transactions_mixed.json** - Mixed legitimate and suspicious
   - Combination of normal and suspicious transactions
   - Tests algorithm discrimination capabilities
   - Expected: Varied risk scores

## QR Code Test Files

### Clean QR Codes (Expected: Low Risk)
1. **clean_merchant_qr.txt** - Legitimate store payment
2. **normal_restaurant_qr.txt** - Restaurant payment
3. **sample_qr_5.txt** - Gas station payment

### Suspicious QR Codes (Expected: Medium Risk)
4. **suspicious_qr.txt** - Suspicious payment request
5. **test_steganography_qr.txt** - Steganography test case

### High-Risk QR Codes (Expected: High Risk)
6. **phishing_qr.txt** - Phishing attempt simulation

## How to Use the Test Data

### Testing Transaction Analysis
1. Login to ShieldPay with credentials: admin@shieldpay.com / admin123
2. Navigate to the Transactions section
3. Upload any CSV or JSON file from the transaction data
4. Observe the analysis results and pattern detection
5. Check the generated alerts in the Alerts section

### Testing QR Code Analysis
1. Go to the QR Scanner section
2. Rename any .txt file to .png or .jpg extension
3. Upload the file to test steganography detection
4. Review the risk classification and analysis details
5. Monitor alerts generated for high-risk QR codes

### Expected Detection Patterns

#### Transaction Patterns
- **Smurfing**: Multiple transactions just under 10,000 threshold
- **Flash Laundering**: Rapid circular transfers between accounts
- **Mule Networks**: Multiple accounts controlled from same device
- **Circular Transfers**: Money flowing in circles between accounts

#### QR Code Patterns
- **LSB Steganography**: Hidden data in least significant bits
- **Phishing Detection**: Suspicious merchant names and amounts
- **Anomaly Detection**: Unusual payment patterns or amounts

## Risk Score Ranges
- **0-30**: Low risk (clean transactions/QR codes)
- **31-70**: Medium risk (suspicious patterns detected)
- **71-100**: High risk (confirmed fraud patterns)

## Testing Recommendations
1. Start with clean data to verify normal operations
2. Progress to suspicious data to test detection algorithms
3. Use high-risk data to validate alert generation
4. Test mixed data to ensure proper classification
5. Verify alert acknowledgment and account flagging workflows

## Data Authenticity
All transaction patterns are based on real-world money laundering techniques documented in financial security literature. QR code scenarios reflect actual phishing and steganography attack vectors identified in cybersecurity research.