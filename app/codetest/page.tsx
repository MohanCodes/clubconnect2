"use client";

import React, { useState, useEffect } from "react";
import {
  getTodayId,
  getDailyCode,
  refreshDailyCode,
  setupMidnightRefresh,
  validateCode,
} from "@/helpers/codeHelpers";

const DailyCode: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const todayId = getTodayId();

  // Load code and setup refresh
  useEffect(() => {
    let isMounted = true;

    const loadCode = async () => {
      setLoading(true);
      try {
        const newCode = await getDailyCode(todayId);
        if (isMounted) setCode(newCode);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCode();
    const cleanup = setupMidnightRefresh(() => {
      loadCode();
    });

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [todayId]);

  // Burn code handler
  const handleBurnCode = async () => {
    setLoading(true);
    try {
      const newCode = await refreshDailyCode(todayId);
      setCode(newCode);
    } finally {
      setLoading(false);
    }
  };

  // Validate user input and refresh code if correct
  const handleCodeCheck = async () => {
    if (!code) {
      setResult("No active code");
      return;
    }
    setLoading(true);
    try {
      const { valid, newCode } = await validateCode(input, todayId, code);
      if (valid) {
        setResult("✅ Correct! Code refreshed.");
        setCode(newCode!);
      } else {
        setResult("❌ Incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cblack">
      <div className="p-4 text-gray-400">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-cblack">
      <div className="p-4 bg-gray-800 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Daily Code System</h2>
        
        <div className="mb-4">
          <p className="text-gray-400">Current Code:</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-2xl text-green-400">
              {code || "N/A"}
            </span>
            <button
              onClick={handleBurnCode}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Refresh Code
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white"
              maxLength={6}
            />
            <button
              onClick={handleCodeCheck}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Verify
            </button>
          </div>
          {result && (
            <div className="mt-2 text-center font-medium text-white">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCode;
