import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Home, Plus, TrendingUp, Wallet, Zap, Stethoscope,
  Bus, ShoppingBasket, GraduationCap, MoreHorizontal, ChevronDown,
  Sparkles, X,
} from "lucide-react";
import dashboardBg from "./assets/image2.jpg";

const CATS = [
  { key: "groceries", label: "Groceries", icon: ShoppingBasket, color: "#7C8B4A", budget: 6000 },
  { key: "utilities", label: "Electricity & Water", icon: Zap, color: "#3D7068", budget: 2500 },
  { key: "rent", label: "Rent / EMI", icon: Home, color: "#2C4A6B", budget: 12000 },
  { key: "fees", label: "School Fees", icon: GraduationCap, color: "#C99A3F", budget: 4000 },
  { key: "medical", label: "Medical", icon: Stethoscope, color: "#B23A2E", budget: 1500 },
  { key: "transport", label: "Transport", icon: Bus, color: "#6B4C6B", budget: 2000 },
  { key: "other", label: "Others", icon: MoreHorizontal, color: "#9A9384", budget: 1500 },
];

const INITIAL_SPENT = {
  groceries: 4820, utilities: 2140, rent: 12000, fees: 4000,
  medical: 620, transport: 1380, other: 940,
};

const TREND = [
  { m: "Mar", total: 24200 }, { m: "Apr", total: 25600 }, { m: "May", total: 23800 },
  { m: "Jun", total: 26100 }, { m: "Jul", total: 25200 }, { m: "Aug", total: 0 },
];

const INITIAL_LOG = [
  { id: 1, cat: "groceries", note: "Vegetables & rice", amount: 1240, date: "Aug 21" },
  { id: 2, cat: "utilities", note: "KSEB electricity bill", amount: 1620, date: "Aug 18" },
  { id: 3, cat: "transport", note: "Petrol", amount: 500, date: "Aug 15" },
  { id: 4, cat: "medical", note: "Pharmacy", amount: 620, date: "Aug 12" },
  { id: 5, cat: "fees", note: "Tuition fee", amount: 4000, date: "Aug 5" },
];

function currency(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function categoryKeyFromLabel(label) {
  const l = label.toLowerCase();
  if (l.includes("groc")) return "groceries";
  if (l.includes("elect")) return "utilities";
  if (l.includes("rent")) return "rent";
  if (l.includes("fee")) return "fees";
  if (l.includes("med")) return "medical";
  if (l.includes("trans")) return "transport";
  return "other";
}

function Perforation({ color }) {
  return (
    <div
      className="h-3 w-full"
      style={{
        backgroundImage: `radial-gradient(circle, #FBF6EE 2.5px, transparent 2.6px)`,
        backgroundSize: "14px 14px",
        backgroundPosition: "0 -6px",
        backgroundColor: color,
      }}
    />
  );
}

function StubCard({ cat, spent }) {
  const pct = Math.min(100, Math.round((spent / cat.budget) * 100));
  const over = spent > cat.budget;
  const Icon = cat.icon;
  return (
    <div className="min-w-[168px] shrink-0 rounded-b-lg overflow-hidden shadow-md">
      <Perforation color={cat.color} />
      <div className="bg-white px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + "22" }}>
            <Icon size={14} style={{ color: cat.color }} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-medium leading-tight">{cat.label}</span>
        </div>
        <div className="font-serif text-xl text-gray-800">{currency(spent)}</div>
        <div className="text-[11px] text-gray-400 mb-2 font-mono">of {currency(cat.budget)}</div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: pct + "%", backgroundColor: over ? "#B23A2E" : cat.color }}
          />
        </div>
        {over && <div className="text-[10px] text-red-600 mt-1.5 font-medium">Over budget</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

  function handleLogin(newToken, name) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", name);
    setToken(newToken);
    setUserName(name);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken("");
    setUserName("");
  }

  const [spent, setSpent] = useState(INITIAL_SPENT);
  const [log, setLog] = useState(INITIAL_LOG);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cat: "groceries", note: "", amount: "" });

  const totalSpent = useMemo(() => Object.values(spent).reduce((a, b) => a + b, 0), [spent]);
  const totalBudget = useMemo(() => CATS.reduce((a, c) => a + c.budget, 0), []);
  const remaining = totalBudget - totalSpent;

  const trendData = useMemo(() => {
    const d = [...TREND];
    d[d.length - 1] = { m: "Aug", total: totalSpent };
    return d;
  }, [totalSpent]);

  const predicted = useMemo(() => {
    const past = TREND.slice(0, 5).map((t) => t.total);
    const avgDelta = (past[4] - past[0]) / 4;
    return Math.round(past[4] + avgDelta);
  }, []);

  const pieData = CATS.map((c) => ({ name: c.label, value: spent[c.key], color: c.color }));
  const nearLimit = CATS.find((c) => spent[c.key] / c.budget > 0.85 && spent[c.key] / c.budget <= 1);

  useEffect(() => {
    if (!token) return;
    axios.get("https://home-expense-tracker-pfx6.onrender.com/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const data = res.data;
      setLog(data.map((e) => ({
        id: e.id,
        cat: categoryKeyFromLabel(e.category),
        note: e.description,
        amount: e.amount,
        date: e.date,
      })));
      const totals = {};
      data.forEach((e) => {
        const key = categoryKeyFromLabel(e.category);
        totals[key] = (totals[key] || 0) + e.amount;
      });
      setSpent((s) => ({ ...s, ...totals }));
    }).catch((err) => console.log(err));
  }, [token]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  async function submitExpense(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    const catLabel = CATS.find((c) => c.key === form.cat).label;
    try {
      await axios.post("https://home-expense-tracker-pfx6.onrender.com/api/expenses", {
        amount: amt,
        category: catLabel,
        description: form.note,
        date: new Date().toISOString().split("T")[0],
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSpent((s) => ({ ...s, [form.cat]: (s[form.cat] || 0) + amt }));
      setLog((l) => [
        { id: Date.now(), cat: form.cat, note: form.note || "Expense", amount: amt, date: "Today" },
        ...l,
      ]);
      setForm({ cat: "groceries", note: "", amount: "" });
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `linear-gradient(rgba(251,246,238,0.88), rgba(251,246,238,0.88)), url(${dashboardBg})` }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-[#1F3D33] flex items-center justify-center shadow-sm">
              <Wallet size={20} className="text-[#EFE3C2]" />
            </div>
            <div>
              <div className="font-serif text-[22px] leading-none text-[#1F3D33] font-semibold">Home Ledger</div>
              <div className="text-[12px] text-gray-400 mt-0.5">Hi, {userName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-full px-3.5 py-2 shadow-sm">
              August 2026 <ChevronDown size={14} className="text-gray-400" />
            </button>
            <button onClick={handleLogout} className="text-[12px] text-gray-500 bg-white border border-gray-200 rounded-full px-3.5 py-2 shadow-sm">
              Log out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-[#1F3D33] text-[#F5EEDD] p-5">
            <div className="text-[11px] uppercase tracking-wide text-[#B7C9BE] mb-2">Spent this month</div>
            <div className="font-serif text-[32px] leading-none">{currency(totalSpent)}</div>
            <div className="text-[12px] text-[#B7C9BE] mt-2">of {currency(totalBudget)} budgeted</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400 mb-2">
              <Wallet size={13} /> Remaining
            </div>
            <div className={`font-serif text-[32px] leading-none ${remaining < 0 ? "text-red-600" : "text-gray-800"}`}>
              {currency(Math.abs(remaining))}
            </div>
            <div className="text-[12px] text-gray-400 mt-2">{remaining < 0 ? "over budget" : "left to spend"}</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400 mb-2">
              <TrendingUp size={13} /> Predicted next month
            </div>
            <div className="font-serif text-[32px] leading-none text-gray-800">{currency(predicted)}</div>
            <div className="text-[12px] text-gray-400 mt-2">based on last 5 months</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-[13px] font-medium text-gray-800 mb-3">By category</div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {CATS.map((c) => <StubCard key={c.key} cat={c} spent={spent[c.key]} />)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
          <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-5">
            <div className="text-[13px] font-medium text-gray-800 mb-1">Where it went</div>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="#FBF6EE" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip formatter={(v) => currency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-3 rounded-xl bg-white border border-gray-200 p-5">
            <div className="text-[13px] font-medium text-gray-800 mb-3">6-month trend</div>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => currency(v)} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#C99A3F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {nearLimit && (
          <div className="rounded-xl bg-[#F5EEDD] border border-[#E9DCB8] p-4 flex gap-3 mb-8">
            <Sparkles size={16} className="text-[#C99A3F] shrink-0 mt-0.5" />
            <div className="text-[13px] text-gray-700">{nearLimit.label} is close to its budget limit.</div>
          </div>
        )}

        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="text-[13px] font-medium text-gray-800">Recent entries</div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-[12px] font-medium text-[#F5EEDD] bg-[#1F3D33] rounded-full px-3.5 py-2">
              <Plus size={14} /> Add expense
            </button>
          </div>
          <div className="divide-y">
            {log.slice(0, 6).map((item) => {
              const cat = CATS.find((c) => c.key === item.cat) || CATS[6];
              const Icon = cat.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + "22" }}>
                    <Icon size={14} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-gray-800 truncate">{item.note}</div>
                    <div className="text-[11px] text-gray-400">{cat.label} · {item.date}</div>
                  </div>
                  <div className="font-mono text-[13px] text-gray-800">{currency(item.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FBF6EE] rounded-xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="font-serif text-[16px] text-[#1F3D33] font-semibold">Add expense</div>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={submitExpense} className="p-5 space-y-3.5">
              <select value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))} className="w-full text-[13px] bg-white border rounded-lg px-3 py-2.5">
                {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Note" className="w-full text-[13px] bg-white border rounded-lg px-3 py-2.5" />
              <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Amount" required className="w-full text-[13px] bg-white border rounded-lg px-3 py-2.5" />
              <button type="submit" className="w-full bg-[#1F3D33] text-[#F5EEDD] text-[13px] font-medium rounded-lg py-2.5">Save entry</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}