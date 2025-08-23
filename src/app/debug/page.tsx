'use client'

import React, { useState, useEffect } from 'react';

const DebugPage = () => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [strategies, setStrategies] = useState<any>(null);
  const [testStrategyId, setTestStrategyId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Error testing database:', error);
      setDbStatus({ error: 'Failed to test database' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/strategies');
      const data = await response.json();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setStrategies({ error: 'Failed to fetch strategies' });
    } finally {
      setLoading(false);
    }
  };

  const createTestStrategy = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-db', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.strategy_id) {
        setTestStrategyId(data.strategy_id);
        alert(`Test strategy created with ID: ${data.strategy_id}`);
      }
    } catch (error) {
      console.error('Error creating test strategy:', error);
      alert('Failed to create test strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Debug Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Test Database Connection
        </button>
        
        <button
          onClick={fetchStrategies}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Fetch All Strategies
        </button>
        
        <button
          onClick={createTestStrategy}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          Create Test Strategy
        </button>
      </div>

      {dbStatus && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Database Status</h2>
          <pre className="text-white text-sm overflow-auto">
            {JSON.stringify(dbStatus, null, 2)}
          </pre>
        </div>
      )}

      {strategies && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Strategies</h2>
          <pre className="text-white text-sm overflow-auto">
            {JSON.stringify(strategies, null, 2)}
          </pre>
        </div>
      )}

      {testStrategyId && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Test Strategy Created</h2>
          <p className="text-white">Strategy ID: {testStrategyId}</p>
          <a
            href={`/strategies/${testStrategyId}`}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            View Strategy Page
          </a>
        </div>
      )}
    </div>
  );
};

export default DebugPage;
