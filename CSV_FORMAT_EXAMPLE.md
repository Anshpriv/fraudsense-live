# CSV Data Format for Fraud Detection

## Required Columns

Your CSV file should include these columns for the fraud detection model to work properly:

### Basic Transaction Data

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| `amount` or `Amount` | Float | Transaction amount | 150.50 |
| `merchant` or `Merchant` | String | Merchant/store name | "Amazon Store" |
| `transaction_time` or `time` | ISO Datetime | When transaction occurred | "2024-11-16T14:30:00Z" |

### Optional Columns (Recommended)

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| `category` | String | Transaction category | "Electronics" |
| `is_fraud` or `fraud` | Boolean | Fraud label (for training) | true / false |
| `user_id` or `userId` | String/UUID | User identifier | "user_123" |
| `location` | String | Transaction location | "New York, NY" |
| `device` | String | Device used | "mobile" |

## Example CSV

```csv
amount,merchant,category,transaction_time,is_fraud,user_id
45.99,Coffee Shop,Food & Drink,2024-11-16T08:30:00Z,false,user_001
1250.00,Electronics Store,Electronics,2024-11-16T14:15:00Z,true,user_002
89.50,Grocery Market,Groceries,2024-11-16T18:45:00Z,false,user_001
3500.00,Unknown Merchant,Unknown,2024-11-16T23:30:00Z,true,user_003
25.00,Gas Station,Transport,2024-11-16T12:00:00Z,false,user_002
```

## Sample Data Generator

Use this Python script to generate sample transaction data:

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_transactions(n_samples=1000, fraud_rate=0.1):
    """Generate sample fraud detection training data"""
    
    np.random.seed(42)
    
    # Merchants
    merchants = [
        "Amazon Store", "Walmart", "Target", "Coffee Shop",
        "Gas Station", "Grocery Market", "Electronics Store",
        "Restaurant", "Online Retailer", "Department Store"
    ]
    
    categories = [
        "Electronics", "Groceries", "Food & Drink", "Transport",
        "Shopping", "Entertainment", "Services", "Healthcare"
    ]
    
    # Generate data
    data = []
    start_date = datetime.now() - timedelta(days=30)
    
    for i in range(n_samples):
        is_fraud = np.random.random() < fraud_rate
        
        # Fraudulent transactions tend to be higher amounts
        if is_fraud:
            amount = np.random.exponential(500) + 500
            merchant = np.random.choice(merchants[-3:])  # Unusual merchants
            hour = np.random.choice([0, 1, 2, 3, 23])  # Odd hours
        else:
            amount = np.random.exponential(50) + 10
            merchant = np.random.choice(merchants[:-3])
            hour = np.random.choice(range(8, 22))  # Normal hours
        
        transaction_time = start_date + timedelta(
            days=np.random.randint(0, 30),
            hours=hour,
            minutes=np.random.randint(0, 60)
        )
        
        data.append({
            'amount': round(amount, 2),
            'merchant': merchant,
            'category': np.random.choice(categories),
            'transaction_time': transaction_time.isoformat() + 'Z',
            'is_fraud': is_fraud,
            'user_id': f'user_{np.random.randint(1, 101):03d}'
        })
    
    df = pd.DataFrame(data)
    return df

# Generate and save
df = generate_sample_transactions(1000, fraud_rate=0.15)
df.to_csv('sample_transactions.csv', index=False)
print(f"Generated {len(df)} transactions")
print(f"Fraud rate: {df['is_fraud'].mean():.1%}")
```

## Data Quality Tips

### For Best Results:

1. **Include fraud labels** (`is_fraud` column) for supervised learning
2. **Use consistent datetime format**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
3. **Include diverse data**: Mix of fraud and legitimate transactions
4. **Minimum recommended size**: 500+ transactions
5. **Fraud rate**: Aim for 5-20% fraud rate in training data

### Common Issues:

- **Missing values**: Fill or remove rows with missing critical fields
- **Inconsistent formats**: Use same column names throughout
- **Time zones**: Use UTC (Z suffix) for consistency
- **Currency**: All amounts in same currency

## Feature Engineering (Backend)

Your Python backend should extract these features:

- **Temporal**: Hour of day, day of week, time since last transaction
- **Amount**: Log amount, z-score, deviation from user average
- **Merchant**: Frequency, category encoding, merchant risk score
- **User**: Transaction velocity, amount patterns, location changes

## Validation

Before uploading, verify:

✅ File is valid CSV format  
✅ Has required columns (amount, merchant, time)  
✅ No corrupted rows  
✅ Reasonable value ranges  
✅ Datetime strings are parseable  

## Download Sample Dataset

A sample CSV with 1000 transactions is available in the repository at:
`/examples/sample_transactions.csv`

Use this to test the upload and training flow!
