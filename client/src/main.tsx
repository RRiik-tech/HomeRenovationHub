import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

console.log("Main.tsx loaded");

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (rootElement) {
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  console.log("Rendering App...");
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  console.log("App rendered successfully");
} else {
  console.error("Root element not found!");
}
