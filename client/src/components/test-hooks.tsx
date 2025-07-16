import React, { useState, useEffect } from 'react';

export function TestHooks() {
  console.log("TestHooks component rendering");
  
  const [testState, setTestState] = useState("test");
  
  useEffect(() => {
    console.log("TestHooks useEffect called");
  }, []);
  
  return (
    <div>
      <h1>Test Hooks Component</h1>
      <p>State: {testState}</p>
      <button onClick={() => setTestState("updated")}>Update State</button>
    </div>
  );
} 