// src/App.tsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages";

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-[#0d0d0d]">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}
