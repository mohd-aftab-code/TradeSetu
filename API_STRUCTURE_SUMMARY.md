# API Structure Summary

## Reorganized API Structure

The API has been reorganized according to user roles and functionality:


### 2. Admin APIs (`/api/admin/`)
- **`/api/admin/users`** - User management for admins (GET)
  - Get all users in the system
- **`/api/admin/users/create`** - Create users (POST)
  - Create new users (admin function)
- **`/api/admin/stats`** - Admin dashboard statistics (GET)
  - Get system-wide statistics and metrics
- **`/api/admin/verify-tables`** - Database verification (GET)
  - Verify database tables and structure

### 3. Sales APIs (`/api/sales/`)
- **`/api/sales/profile`** - Sales executive profile (GET, PUT)
  - Get sales executive profile information
  - Update sales executive profile information
- **`/api/sales/dashboard`** - Sales dashboard data (GET)
  - Get sales metrics, leads, and tasks

### 1. Auth APIs (`/api/auth/`)
- **`/api/auth/login`** - User login (POST)
- **`/api/auth/register`** - User registration (POST)
- **`/api/auth/profile`** - User profile management (GET, PUT)
  - Get user profile information
  - Update user profile information

### 4. User APIs (`/api/users/`)
- **`/api/users/broker/connect`** - Broker connection (GET, POST)
- **`/api/users/indicators`** - Technical indicators (GET)
- **`/api/users/market-data`** - Market data (GET)
- **`/api/users/strategies/`** - Strategy management
  - `GET /api/users/strategies` - List strategies
  - `POST /api/users/strategies` - Create strategy
  - `GET /api/users/strategies/[id]` - Get specific strategy
  - `PUT /api/users/strategies/[id]` - Update strategy
  - `DELETE /api/users/strategies/[id]` - Delete strategy
  - `GET /api/users/strategies/[id]/backtest` - Backtest strategy
  - `GET /api/users/strategies/indicator-based` - Indicator-based strategies
  - `GET /api/users/strategies/time-based` - Time-based strategies
  - `GET /api/users/strategies/programming` - Programming strategies
  - `GET /api/users/strategies/performance` - Strategy performance

## Updated Frontend References

### Sales Dashboard
- Updated to use `/api/sales/profile` instead of `/api/user/profile`
- Added `/api/sales/dashboard` for sales-specific data


### Admin Pages
- Already using correct admin APIs (`/api/admin/users`, `/api/admin/users/create`)

### User Pages
- Updated all API references to use `/api/users/` prefix:
  - Dashboard: `/api/users/broker/connect`, `/api/users/market-data`, `/api/auth/profile`
  - Market Insight: `/api/users/market-data`
  - Strategy Creation: `/api/users/indicators`, `/api/users/strategies`
  - Strategy Details: `/api/users/strategies/[id]`
  - Strategy List: `/api/users/strategies`
  - Profile Page: `/api/auth/profile`
  - Backtesting Page: `/api/auth/profile`

## Security Considerations

All APIs now include proper authentication and authorization:
- User APIs: Require valid user token
- Admin APIs: Require admin role verification
- Sales APIs: Require sales executive role verification

## API Path Changes Made

1. **Moved** `/api/verify-tables` → `/api/admin/verify-tables`
2. **Created** `/api/sales/profile` (new)
3. **Created** `/api/sales/dashboard` (new)
4. **Created** `/api/admin/stats` (new)
5. **Moved** `/api/user/profile` → `/api/auth/profile`
6. **Moved** `/api/broker` → `/api/users/broker`
7. **Moved** `/api/indicators` → `/api/users/indicators`
8. **Moved** `/api/market-data` → `/api/users/market-data`
9. **Moved** `/api/strategies` → `/api/users/strategies`

All frontend references have been updated to use the new API paths.
