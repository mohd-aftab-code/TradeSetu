# Database Setup Guide

## Issue Resolution
The strategy creation is not working because the database tables don't exist. Follow these steps to set up the database:

## Step 1: Database Setup

1. **Install MySQL** if you haven't already
2. **Create the database and tables** by running the SQL script:

```bash
mysql -u root -p < database_setup.sql
```

Or manually run the SQL commands in `database_setup.sql`

## Step 2: Environment Configuration

Create a `.env.local` file in the project root with:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trading_platform
DB_PORT=3306
```

## Step 3: Test Database Connection

Visit `http://localhost:3000/api/test-db` to test if the database connection is working.

## Step 4: Verify Tables

The following tables should be created:
- `strategies` - for storing trading strategies
- `backtests` - for storing backtest results
- `backtest_trades` - for storing individual trade logs

## Common Issues

1. **MySQL not running**: Start MySQL service
2. **Wrong credentials**: Check your `.env.local` file
3. **Database doesn't exist**: Run the setup script
4. **Tables don't exist**: Run the setup script

## Testing Strategy Creation

After setup, try creating a strategy again. The API should now work properly.
