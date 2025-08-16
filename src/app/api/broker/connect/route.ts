import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for broker connections (for demo purposes)
const brokerConnections: any[] = [];

// Broker configuration and API endpoints
const BROKER_CONFIGS = {
  zerodha: {
    name: 'Zerodha',
    apiUrl: 'https://api.kite.trade',
    authUrl: 'https://kite.trade/connect/login',
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
    commission: '₹20 or 0.05% (whichever is lower)',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=Z'
  },
  upstox: {
    name: 'Upstox',
    apiUrl: 'https://api-v2.upstox.com',
    authUrl: 'https://login-api.upstox.com/index/dialog/authorize',
    features: ['Equity', 'F&O', 'Currency'],
    commission: '₹20 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/10b981/ffffff?text=U'
  },
  angelone: {
    name: 'Angel One',
    apiUrl: 'https://apiconnect.angelbroking.com',
    authUrl: 'https://smartapi.angelbroking.com/publisher-login',
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
    commission: '₹20 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/f59e0b/ffffff?text=A'
  },
  fyers: {
    name: 'Fyers',
    apiUrl: 'https://api.fyers.in',
    authUrl: 'https://api.fyers.in/api/v2/generate-authcode',
    features: ['Equity', 'F&O', 'Currency'],
    commission: '₹20 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=F'
  },
  aliceblue: {
    name: 'Alice Blue',
    apiUrl: 'https://ant.aliceblueonline.com',
    authUrl: 'https://ant.aliceblueonline.com/oauth2/authorize',
    features: ['Equity', 'F&O', 'Currency'],
    commission: '₹15 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/ec4899/ffffff?text=AB'
  },
  fivepaisa: {
    name: '5paisa',
    apiUrl: 'https://openapi.5paisa.com',
    authUrl: 'https://login.5paisa.com',
    features: ['Equity', 'F&O', 'Currency'],
    commission: '₹10 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/ef4444/ffffff?text=5P'
  },
  dhan: {
    name: 'Dhan',
    apiUrl: 'https://api.dhan.co',
    authUrl: 'https://login.dhan.co',
    features: ['Equity', 'F&O'],
    commission: '₹18 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/06b6d4/ffffff?text=D'
  },
  prostocks: {
    name: 'ProStocks',
    apiUrl: 'https://api.prostocks.com',
    authUrl: 'https://login.prostocks.com',
    features: ['Equity', 'F&O'],
    commission: '₹20 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/84cc16/ffffff?text=PS'
  },
  motilaloswal: {
    name: 'Motilal Oswal',
    apiUrl: 'https://api.motilaloswal.com',
    authUrl: 'https://login.motilaloswal.com',
    features: ['Equity', 'F&O', 'Currency', 'Commodity'],
    commission: '₹25 per trade',
    status: 'active',
    logo: 'https://via.placeholder.com/60x60/f97316/ffffff?text=MO'
  }
};

// Function to generate auth URL for broker
function generateAuthUrl(brokerId: string, clientId: string, redirectUri: string): string {
  const broker = BROKER_CONFIGS[brokerId as keyof typeof BROKER_CONFIGS];
  
  if (!broker) {
    throw new Error('Invalid broker');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: brokerId
  });

  return `${broker.authUrl}?${params.toString()}`;
}

// Function to get API setup instructions for brokers
function getApiSetupInstructions(brokerId: string) {
  const broker = BROKER_CONFIGS[brokerId as keyof typeof BROKER_CONFIGS];
  
  if (!broker) {
    throw new Error('Invalid broker');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  switch (brokerId) {
         case 'upstox':
       return {
         brokerName: broker.name,
         setupUrl: 'https://developer.upstox.com/',
         instructions: [
           '1. Go to Upstox Developer Console (https://developer.upstox.com/)',
           '2. Sign in with your Upstox account',
           '3. Click "Create New App"',
           '4. Fill the following details:',
           '   - App Name: Your app name (e.g., tradesetu)',
           '   - Redirect URL: ' + baseUrl + '/api/broker/callback',
           '   - Primary IP: Your server IP (optional)',
           '   - Postback URL: ' + baseUrl + '/api/broker/webhook (optional)',
           '   - Description: Brief description of your app',
           '5. Accept terms and click "Continue"',
           '6. Copy the generated API Key and API Secret',
           '7. Note: You may need to wait for approval (24-48 hours)',
           '8. Use these credentials in the connection form'
         ],
         requiredFields: ['apiKey', 'apiSecret', 'userId', 'password'],
         optionalFields: ['redirectUrl', 'postbackUrl'],
         additionalNotes: [
           '⚠️ API approval may take 24-48 hours',
           '📱 Ensure your mobile number is verified in Upstox account',
           '🔐 Keep API credentials secure and never share them'
         ]
       };
    
    case 'zerodha':
      return {
        brokerName: broker.name,
        setupUrl: 'https://kite.trade/connect/login',
        instructions: [
          '1. Go to Zerodha Kite Connect',
          '2. Click "Register" for API access',
          '3. Fill the following details:',
          '   - App Name: Your app name',
          '   - Redirect URL: ' + baseUrl + '/api/broker/callback',
          '   - Webhook URL: ' + baseUrl + '/api/broker/webhook (optional)',
          '4. Submit and wait for approval',
          '5. Copy the generated API Key and API Secret',
          '6. Use these credentials in the connection form'
        ],
        requiredFields: ['apiKey', 'apiSecret', 'userId', 'password'],
        optionalFields: ['redirectUrl', 'webhookUrl']
      };
    
    case 'angelone':
      return {
        brokerName: broker.name,
        setupUrl: 'https://smartapi.angelbroking.com/publisher-login',
        instructions: [
          '1. Go to Angel One SmartAPI',
          '2. Click "Register" for API access',
          '3. Fill the following details:',
          '   - App Name: Your app name',
          '   - Redirect URL: ' + baseUrl + '/api/broker/callback',
          '   - Callback URL: ' + baseUrl + '/api/broker/webhook',
          '4. Submit and wait for approval',
          '5. Copy the generated API Key and API Secret',
          '6. Use these credentials in the connection form'
        ],
        requiredFields: ['apiKey', 'apiSecret', 'userId', 'password'],
        optionalFields: ['redirectUrl', 'callbackUrl']
      };
    
    default:
      return {
        brokerName: broker.name,
        setupUrl: broker.authUrl,
        instructions: [
          '1. Visit the broker\'s developer portal',
          '2. Register your application',
          '3. Generate API credentials',
          '4. Use the credentials in the connection form'
        ],
        requiredFields: ['apiKey', 'apiSecret', 'userId', 'password'],
        optionalFields: []
      };
  }
}

// Function to simulate broker connection and get account details
async function connectToBroker(brokerId: string, credentials: any) {
  const broker = BROKER_CONFIGS[brokerId as keyof typeof BROKER_CONFIGS];
  
  if (!broker) {
    throw new Error('Invalid broker');
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate connection success/failure
  const isSuccess = Math.random() > 0.1; // 90% success rate

  if (!isSuccess) {
    throw new Error('Connection failed. Please check your credentials.');
  }

  // Generate realistic account details
  const accountBalance = Math.floor(Math.random() * 500000) + 50000;
  const marginUsed = Math.floor(Math.random() * 100000) + 10000;
  const availableMargin = accountBalance - marginUsed;

  return {
    success: true,
    brokerId,
    brokerName: broker.name,
    accessToken: `token_${brokerId}_${Date.now()}`,
    refreshToken: `refresh_${brokerId}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    accountDetails: {
      accountId: `ACC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      accountType: 'Trading',
      balance: accountBalance,
      marginUsed: marginUsed,
      availableMargin: availableMargin
    }
  };
}

// Function to save broker connection (in-memory for demo)
async function saveBrokerConnection(userId: string, connectionData: any) {
  const connection = {
    id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    broker_name: connectionData.brokerName,
    broker_id: connectionData.brokerId,
    api_key: connectionData.apiKey || null,
    api_secret: connectionData.apiSecret || null,
    access_token: connectionData.accessToken,
    refresh_token: connectionData.refreshToken,
    token_expires_at: connectionData.expiresAt,
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_sync: new Date().toISOString(),
    account_balance: connectionData.accountDetails.balance,
    margin_used: connectionData.accountDetails.marginUsed,
    available_margin: connectionData.accountDetails.availableMargin
  };

  brokerConnections.push(connection);
  return connection;
}

// Function to get user broker connections
async function getUserBrokerConnections(userId: string) {
  return brokerConnections.filter(conn => conn.user_id === userId && conn.is_active === 1);
}

// Function to handle broker-specific errors
function handleBrokerError(brokerId: string, error: any) {
  const errorMessage = error?.message || error?.error || 'Unknown error';
  const errorCode = error?.errorCode || error?.error_code || 'UNKNOWN';
  
  switch (errorCode) {
    case 'UDAPI100060': // Upstox Resource not Found
      return {
        success: false,
        error: 'API credentials not found. Please check your API Key and Secret.',
        details: 'This usually means the API credentials are invalid or not approved yet.',
        solution: 'Verify your API credentials and ensure they are approved by Upstox.'
      };
    
    case 'UDAPI100061': // Upstox Unauthorized
      return {
        success: false,
        error: 'Unauthorized access. Please check your API credentials.',
        details: 'Your API Key or Secret is incorrect.',
        solution: 'Double-check your API Key and Secret from Upstox Developer Console.'
      };
    
    case 'UDAPI100062': // Upstox Rate Limit
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        details: 'You have exceeded the API rate limits.',
        solution: 'Wait for a few minutes before trying again.'
      };
    
    default:
      return {
        success: false,
        error: `Connection failed: ${errorMessage}`,
        details: 'An unexpected error occurred during broker connection.',
        solution: 'Please check your credentials and try again.'
      };
  }
}

// Function to verify OTP (simulated)
async function verifyOTP(brokerId: string, otp: string, userId: string) {
  // Simulate OTP verification
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo: accept any 6-digit OTP
  if (otp.length === 6 && /^\d{6}$/.test(otp)) {
    return { success: true, message: 'OTP verified successfully' };
  } else {
    throw new Error('Invalid OTP. Please enter a 6-digit code.');
  }
}

// GET - Get available brokers and user's existing connections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const brokerId = searchParams.get('brokerId');

    // If brokerId is provided, return API setup instructions
    if (brokerId) {
      try {
        const setupInstructions = getApiSetupInstructions(brokerId);
        return NextResponse.json({
          success: true,
          data: setupInstructions
        });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid broker ID' },
          { status: 400 }
        );
      }
    }

    // Get available brokers
    const brokers = Object.entries(BROKER_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      features: config.features,
      commission: config.commission,
      status: config.status,
      logo: config.logo
    }));

    let userConnections = [];
    
    // If userId provided, get user's existing connections
    if (userId) {
      try {
        userConnections = await getUserBrokerConnections(userId);
      } catch (error) {
        console.error('Error fetching user connections:', error);
        // Continue without user connections
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        availableBrokers: brokers,
        userConnections: userConnections,
        total: brokers.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brokers' },
      { status: 500 }
    );
  }
}

// POST - Connect to broker
export async function POST(request: NextRequest) {
  let body: any = {};
  let brokerId: string = '';
  
  try {
    body = await request.json();
    brokerId = body.brokerId;
    const { credentials, connectionType, userId, otp } = body;

    if (!brokerId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Broker ID and User ID are required' },
        { status: 400 }
      );
    }

    // Validate broker exists
    if (!BROKER_CONFIGS[brokerId as keyof typeof BROKER_CONFIGS]) {
      return NextResponse.json(
        { success: false, error: 'Invalid broker ID' },
        { status: 400 }
      );
    }

    let result;

    if (connectionType === 'auth_url') {
      // Generate auth URL for OAuth flow
      const clientId = process.env[`${brokerId.toUpperCase()}_CLIENT_ID`] || 'demo_client_id';
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/broker/callback`;
      
      const authUrl = generateAuthUrl(brokerId, clientId, redirectUri);
      
      result = {
        success: true,
        authUrl,
        brokerId,
        message: 'Auth URL generated successfully'
      };
    } else if (connectionType === 'otp_verification') {
      // OTP verification flow
      const verificationResult = await verifyOTP(brokerId, otp, userId);
      
      if (verificationResult.success) {
        // After OTP verification, proceed with connection
        const connectionData = await connectToBroker(brokerId, credentials);
        
        // Save to in-memory storage
        const savedConnection = await saveBrokerConnection(userId, {
          ...connectionData,
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret
        });

        result = {
          success: true,
          connection: savedConnection,
          message: `Successfully connected to ${connectionData.brokerName}`
        };
      }
    } else {
      // Direct connection with credentials
      const connectionData = await connectToBroker(brokerId, credentials);
      
      // Save to in-memory storage
      const savedConnection = await saveBrokerConnection(userId, {
        ...connectionData,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret
      });

      result = {
        success: true,
        connection: savedConnection,
        message: `Successfully connected to ${connectionData.brokerName}`
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Broker connection error:', error);
    
    // Handle broker-specific errors
    const errorResponse = handleBrokerError(brokerId || 'unknown', error);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
