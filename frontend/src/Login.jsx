import React, { useState } from "react";
import axios from "axios";
import { Wallet } from "lucide-react";
import loginBg from "./assets/image1.jpg";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await axios.post("https://home-expense-tracker-pfx6.onrender.com/api/register", form);
        // after registering, log them in automatically
        const res = await axios.post("https://home-expense-tracker-pfx6.onrender.com/api/login", {
          email: form.email,
          password: form.password,
        });
        onLogin(res.data.access_token, res.data.name);
      } else {
        const res = await axios.post("https://home-expense-tracker-pfx6.onrender.com/api/login", {
          email: form.email,
          password: form.password,
        });
        onLogin(res.data.access_token, res.data.name);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
  className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
  style={{
    backgroundImage: `linear-gradient(rgba(251,246,238,0.55), rgba(251,246,238,0.55)), url(${loginBg})`
  }}
>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-lg bg-[#5A3D33] flex items-center justify-center">
            <Wallet size={20} className="text-[#FFFFFF]" />
          </div>
          <div className="font-serif text-[20px] text-[#1000000] font-semibold">Home Ledger</div>
        </div>

        <div className="text-[15px] font-medium text-gray-800 mb-4">
          {isRegister ? "Create an account" : "Welcome back"}
        </div>

        {error && (
          <div className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Name"
              required
              className="w-full text-[13px] bg-[#FFF8EE] border border-gray-200 rounded-lg px-3 py-2.5"
            />
          )}
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            required
            className="w-full text-[13px] bg-[#FFF8EE] border border-gray-200 rounded-lg px-3 py-2.5"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Password"
            required
            className="w-full text-[13px] bg-[#FFF8EE] border border-gray-200 rounded-lg px-3 py-2.5"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5A3D33] text-[#F5EEDD] text-[13px] font-medium rounded-lg py-2.5"
          >
            {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <button
          onClick={() => setIsRegister((v) => !v)}
          className="text-[12px] text-gray-500 mt-4 w-full text-center"
        >
          {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}