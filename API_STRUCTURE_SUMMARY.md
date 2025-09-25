# API Structure Summary

## Reorganized API Structure

The API has been reorganized according to user roles and functionality:

### 1. User APIs (`/api/user/`)
- **`/api/user/profile`** - User profile management (GET, PUT)
  - Get user profile information
  - Update user profile information

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

### 4. Auth APIs (`/api/auth/`)
- **`/api/auth/login`** - User login (POST)
- **`/api/auth/register`** - User registration (POST)

### 5. General APIs
- **`/api/broker/connect`** - Broker connection
- **`/api/indicators`** - Technical indicators
- **`/api/market-data`** - Market data
- **`/api/strategies/`** - Strategy management
  - `GET /api/strategies` - List strategies
  - `POST /api/strategies` - Create strategy
  - `GET /api/strategies/[id]` - Get specific strategy
  - `PUT /api/strategies/[id]` - Update strategy
  - `DELETE /api/strategies/[id]` - Delete strategy
  - `GET /api/strategies/[id]/backtest` - Backtest strategy
  - `GET /api/strategies/indicator-based` - Indicator-based strategies
  - `GET /api/strategies/time-based` - Time-based strategies
  - `GET /api/strategies/programming` - Programming strategies
  - `GET /api/strategies/performance` - Strategy performance

## Updated Frontend References

### Sales Dashboard
- Updated to use `/api/sales/profile` instead of `/api/user/profile`
- Added `/api/sales/dashboard` for sales-specific data


### Admin Pages
- Already using correct admin APIs (`/api/admin/users`, `/api/admin/users/create`)

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

All existing API paths remain unchanged to maintain backward compatibility.
