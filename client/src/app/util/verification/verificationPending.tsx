"use client";
import { Clock } from "lucide-react";

export default function VerificationPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 px-4">
      <div className="relative backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center animate-fade-in">
        {/* Glow Ring */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300 opacity-30 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300 opacity-30 blur-3xl rounded-full animate-pulse"></div>

        <Clock className="h-16 w-16 text-purple-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Hold Tight! 🚀
        </h1>
        <p className="text-gray-700 text-lg">
          Your application is currently under verification.
        </p>
        <p className="text-gray-600 mt-2">
          This process may take up to{" "}
          <span className="font-semibold text-purple-700">48 hours</span>.
        </p>

        <div className="mt-8">
          <span className="text-sm text-gray-500">
            We appreciate your patience and look forward to having you onboard.
          </span>
        </div>
      </div>
    </div>
  );
}
