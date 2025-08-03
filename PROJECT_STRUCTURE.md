# Algo Trading Project Structure

## Complete Project Organization

```
algo-trading-system/
│
├── README.md                    # Project documentation
├── requirements.txt             # Python dependencies
├── config.json                 # Configuration file
├── .env                        # Environment variables
│
├── src/                        # Main source code
│   ├── __init__.py
│   │
│   ├── data/                   # Data handling modules
│   │   ├── __init__.py
│   │   ├── data_feed.py        # Real-time data collection
│   │   ├── historical_data.py  # Historical data fetching
│   │   ├── data_processor.py   # Data cleaning and processing
│   │   └── data_validator.py   # Data validation
│   │
│   ├── strategies/             # Trading strategies
│   │   ├── __init__.py
│   │   ├── base_strategy.py    # Base strategy class
│   │   ├── moving_average.py   # MA crossover strategy
│   │   ├── rsi_strategy.py     # RSI strategy
│   │   ├── breakout_strategy.py # Breakout strategy
│   │   └── mean_reversion.py   # Mean reversion strategy
│   │
│   ├── execution/              # Order execution
│   │   ├── __init__.py
│   │   ├── order_manager.py    # Order placement and tracking
│   │   ├── position_tracker.py # Position management
│   │   ├── risk_manager.py     # Risk management
│   │   └── broker_interface.py # Broker API integration
│   │
│   ├── backtesting/            # Backtesting framework
│   │   ├── __init__.py
│   │   ├── backtest_engine.py  # Main backtesting engine
│   │   ├── performance.py      # Performance metrics
│   │   ├── optimization.py     # Strategy optimization
│   │   └── reports.py          # Backtest reports
│   │
│   ├── utils/                  # Utility functions
│   │   ├── __init__.py
│   │   ├── logger.py           # Logging utilities
│   │   ├── helpers.py          # Helper functions
│   │   ├── constants.py        # Constants and enums
│   │   └── validators.py       # Input validation
│   │
│   ├── web/                    # Web dashboard
│   │   ├── __init__.py
│   │   ├── app.py              # Flask application
│   │   ├── routes.py           # API routes
│   │   ├── templates/          # HTML templates
│   │   │   ├── dashboard.html
│   │   │   ├── strategies.html
│   │   │   ├── backtesting.html
│   │   │   └── settings.html
│   │   └── static/             # CSS, JS, images
│   │       ├── css/
│   │       ├── js/
│   │       └── images/
│   │
│   └── main.py                 # Main application entry point
│
├── tests/                      # Unit tests
│   ├── __init__.py
│   ├── test_data_feed.py
│   ├── test_strategies.py
│   ├── test_execution.py
│   ├── test_backtesting.py
│   └── test_utils.py
│
├── data/                       # Data storage
│   ├── historical/             # Historical data files
│   ├── live/                   # Live data cache
│   ├── backtest_results/       # Backtest results
│   └── logs/                   # Application logs
│
├── config/                     # Configuration files
│   ├── strategies.json         # Strategy configurations
│   ├── brokers.json            # Broker settings
│   ├── risk_rules.json         # Risk management rules
│   └── logging.json            # Logging configuration
│
├── docs/                       # Documentation
│   ├── api_docs.md
│   ├── strategy_guide.md
│   ├── deployment_guide.md
│   └── troubleshooting.md
│
└── scripts/                    # Utility scripts
    ├── setup.py                # Setup script
    ├── install_dependencies.py # Dependency installation
    ├── run_backtest.py         # Backtest runner
    └── deploy.py               # Deployment script
```

## Key Files Explanation

### 1. Configuration Files

#### config.json
```json
{
  "broker": {
    "name": "zerodha",
    "api_key": "your_api_key",
    "api_secret": "your_api_secret",
    "access_token": "your_access_token"
  },
  "trading": {
    "default_quantity": 100,
    "max_positions": 5,
    "stop_loss_percentage": 5,
    "take_profit_percentage": 10
  },
  "data": {
    "update_interval": 300,
    "historical_days": 365,
    "symbols": ["RELIANCE", "TCS", "INFY", "HDFC"]
  },
  "risk": {
    "max_daily_loss": 10000,
    "max_position_size": 50000,
    "max_open_positions": 3
  }
}
```

#### .env
```env
BROKER_API_KEY=your_api_key_here
BROKER_API_SECRET=your_api_secret_here
BROKER_ACCESS_TOKEN=your_access_token_here
DATABASE_URL=postgresql://user:password@localhost/trading_db
LOG_LEVEL=INFO
ENVIRONMENT=development
```

### 2. Core Modules

#### src/data/data_feed.py
```python
import asyncio
import websockets
import json
from typing import Dict, List, Callable

class DataFeed:
    def __init__(self, symbols: List[str], callback: Callable):
        self.symbols = symbols
        self.callback = callback
        self.websocket = None
    
    async def connect(self):
        """Connect to real-time data feed"""
        pass
    
    async def subscribe(self, symbols: List[str]):
        """Subscribe to symbols for real-time data"""
        pass
    
    async def handle_message(self, message: str):
        """Handle incoming market data"""
        pass
```

#### src/strategies/base_strategy.py
```python
from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Any

class BaseStrategy(ABC):
    def __init__(self, name: str, parameters: Dict[str, Any]):
        self.name = name
        self.parameters = parameters
        self.positions = {}
    
    @abstractmethod
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Generate buy/sell signals from market data"""
        pass
    
    @abstractmethod
    def should_buy(self, data: pd.DataFrame) -> bool:
        """Check if should buy"""
        pass
    
    @abstractmethod
    def should_sell(self, data: pd.DataFrame) -> bool:
        """Check if should sell"""
        pass
    
    def update_parameters(self, new_params: Dict[str, Any]):
        """Update strategy parameters"""
        self.parameters.update(new_params)
```

#### src/execution/order_manager.py
```python
from typing import Dict, List, Optional
import logging

class OrderManager:
    def __init__(self, broker_interface):
        self.broker = broker_interface
        self.orders = {}
        self.logger = logging.getLogger(__name__)
    
    def place_order(self, symbol: str, quantity: int, 
                   order_type: str, price: Optional[float] = None):
        """Place a new order"""
        try:
            order = self.broker.place_order(
                symbol=symbol,
                quantity=quantity,
                order_type=order_type,
                price=price
            )
            self.orders[order['order_id']] = order
            self.logger.info(f"Order placed: {order}")
            return order
        except Exception as e:
            self.logger.error(f"Order placement failed: {e}")
            return None
    
    def cancel_order(self, order_id: str):
        """Cancel an existing order"""
        pass
    
    def get_order_status(self, order_id: str):
        """Get order status"""
        pass
```

#### src/backtesting/backtest_engine.py
```python
import pandas as pd
from typing import Dict, List
from src.strategies.base_strategy import BaseStrategy

class BacktestEngine:
    def __init__(self, strategy: BaseStrategy, initial_capital: float):
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.positions = []
        self.trades = []
        self.equity_curve = []
    
    def run(self, data: pd.DataFrame) -> Dict:
        """Run backtest on historical data"""
        for i in range(len(data)):
            current_data = data.iloc[:i+1]
            
            # Generate signals
            signals = self.strategy.generate_signals(current_data)
            
            # Execute trades
            self._execute_trades(signals.iloc[-1], current_data.iloc[-1])
            
            # Update equity curve
            self._update_equity(current_data.iloc[-1])
        
        return self._calculate_results()
    
    def _execute_trades(self, signal, current_data):
        """Execute trades based on signals"""
        pass
    
    def _update_equity(self, current_data):
        """Update equity curve"""
        pass
    
    def _calculate_results(self) -> Dict:
        """Calculate backtest results"""
        pass
```

### 3. Web Dashboard

#### src/web/app.py
```python
from flask import Flask, render_template, jsonify, request
from src.execution.order_manager import OrderManager
from src.data.data_feed import DataFeed
import threading

app = Flask(__name__)

# Global instances
order_manager = None
data_feed = None

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/start-strategy', methods=['POST'])
def start_strategy():
    data = request.json
    symbol = data.get('symbol')
    strategy = data.get('strategy')
    
    # Start strategy in background
    thread = threading.Thread(target=run_strategy, args=(symbol, strategy))
    thread.start()
    
    return jsonify({'status': 'Strategy started'})

@app.route('/api/positions')
def get_positions():
    if order_manager:
        return jsonify(order_manager.get_positions())
    return jsonify([])

@app.route('/api/orders')
def get_orders():
    if order_manager:
        return jsonify(order_manager.get_orders())
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)
```

### 4. Main Application

#### src/main.py
```python
import asyncio
import logging
from src.data.data_feed import DataFeed
from src.execution.order_manager import OrderManager
from src.strategies.moving_average import MovingAverageStrategy
from src.utils.logger import setup_logging

async def main():
    # Setup logging
    setup_logging()
    logger = logging.getLogger(__name__)
    
    # Initialize components
    strategy = MovingAverageStrategy("MA_Crossover", {
        'short_period': 5,
        'long_period': 20
    })
    
    order_manager = OrderManager(broker_interface=None)  # Add broker interface
    
    data_feed = DataFeed(
        symbols=['RELIANCE', 'TCS'],
        callback=lambda data: process_market_data(data, strategy, order_manager)
    )
    
    # Start data feed
    await data_feed.connect()
    await data_feed.subscribe(['RELIANCE', 'TCS'])
    
    # Keep running
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")

def process_market_data(data, strategy, order_manager):
    """Process incoming market data"""
    signals = strategy.generate_signals(data)
    
    if strategy.should_buy(signals):
        order_manager.place_order(
            symbol=data['symbol'],
            quantity=100,
            order_type='BUY'
        )
    elif strategy.should_sell(signals):
        order_manager.place_order(
            symbol=data['symbol'],
            quantity=100,
            order_type='SELL'
        )

if __name__ == '__main__':
    asyncio.run(main())
```

### 5. Testing Structure

#### tests/test_strategies.py
```python
import unittest
import pandas as pd
from src.strategies.moving_average import MovingAverageStrategy

class TestMovingAverageStrategy(unittest.TestCase):
    def setUp(self):
        self.strategy = MovingAverageStrategy("Test_MA", {
            'short_period': 5,
            'long_period': 20
        })
        
        # Create sample data
        self.sample_data = pd.DataFrame({
            'close': [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110]
        })
    
    def test_signal_generation(self):
        signals = self.strategy.generate_signals(self.sample_data)
        self.assertIn('Signal', signals.columns)
    
    def test_buy_signal(self):
        # Test buy signal logic
        pass
    
    def test_sell_signal(self):
        # Test sell signal logic
        pass

if __name__ == '__main__':
    unittest.main()
```

## Development Workflow

### 1. Setup Phase
```bash
# Clone repository
git clone <repository_url>
cd algo-trading-system

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run tests
python -m pytest tests/
```

### 2. Development Phase
```bash
# Start development server
python src/web/app.py

# Run backtesting
python scripts/run_backtest.py --strategy moving_average --symbol RELIANCE

# Monitor logs
tail -f data/logs/app.log
```

### 3. Deployment Phase
```bash
# Build application
python scripts/deploy.py

# Start production server
gunicorn src.web.app:app
```

## Key Development Principles

1. **Modular Design**: हर component अलग module में
2. **Error Handling**: सभी functions में proper error handling
3. **Logging**: सभी activities को log करें
4. **Testing**: हर feature को test करें
5. **Documentation**: सभी code को document करें
6. **Configuration**: सभी settings को config files में रखें
7. **Security**: API keys और sensitive data को secure रखें
8. **Monitoring**: Real-time monitoring और alerts

यह structure आपको organized और scalable system बनाने में मदद करेगा। 