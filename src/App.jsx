import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, CircleHelp, CreditCard, Download, Ellipsis, FileText,
  Filter, Goal, Home, Lightbulb, LogOut, Menu, Plus, Search, Settings2,
  ShieldCheck, Sparkles, Target, TrendingUp, Wallet, X, PiggyBank,
  Utensils, Car, ShoppingBag, HeartPulse, GraduationCap, Receipt,
  MoreHorizontal, ArrowLeftRight, Calculator, CircleDollarSign
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

const initialTransactions = [
  { id: 1, title: "Monthly salary", category: "Salary", type: "income", amount: 42000, date: "2026-10-25", method: "Bank transfer", note: "Monthly income", need: "Need" },
  { id: 2, title: "Apartment rent", category: "Housing", type: "expense", amount: 10500, date: "2026-10-24", method: "UPI", note: "October rent", need: "Need" },
  { id: 3, title: "Groceries", category: "Food & dining", type: "expense", amount: 1840, date: "2026-10-23", method: "UPI", note: "", need: "Need" },
  { id: 4, title: "Freelance project", category: "Freelance", type: "income", amount: 6500, date: "2026-10-22", method: "Bank transfer", note: "Website project", need: "Need" },
  { id: 5, title: "Coffee with friends", category: "Food & dining", type: "expense", amount: 420, date: "2026-10-21", method: "Card", note: "", need: "Want" },
  { id: 6, title: "Metro & cab", category: "Transport", type: "expense", amount: 680, date: "2026-10-20", method: "UPI", note: "", need: "Need" },
  { id: 7, title: "Streaming subscription", category: "Entertainment", type: "expense", amount: 299, date: "2026-10-19", method: "Card", note: "Monthly plan", need: "Want" },
  { id: 8, title: "Book purchase", category: "Shopping", type: "expense", amount: 750, date: "2026-10-18", method: "UPI", note: "Learning", need: "Want" }
];

const categoryStyles = {
  "Food & dining": { icon: Utensils, color: "#f59e0b", bg: "#fff7e6" },
  Housing: { icon: Home, color: "#7c6cf0", bg: "#f0edff" },
  Transport: { icon: Car, color: "#329b88", bg: "#e6f7f3" },
  Shopping: { icon: ShoppingBag, color: "#e477a7", bg: "#fff0f6" },
  Health: { icon: HeartPulse, color: "#e36d64", bg: "#fff0ee" },
  Education: { icon: GraduationCap, color: "#5288df", bg: "#edf4ff" },
  Salary: { icon: ArrowDownLeft, color: "#219a7a", bg: "#e5f7f0" },
  Freelance: { icon: Activity, color: "#219a7a", bg: "#e5f7f0" },
  Entertainment: { icon: Sparkles, color: "#8b73e6", bg: "#f0edff" },
  Other: { icon: Receipt, color: "#738096", bg: "#f0f2f6" }
};
const spending = [
  { name: "Housing", value: 10500, color: "#8274ee" },
  { name: "Food & dining", value: 2260, color: "#f3b84c" },
  { name: "Transport", value: 680, color: "#42b6a0" },
  { name: "Shopping", value: 750, color: "#ed8eb4" },
  { name: "Other", value: 1019, color: "#8b9bb1" }
];
const trendData = [
  { month: "May", income: 39000, expenses: 23000 },
  { month: "Jun", income: 42000, expenses: 25800 },
  { month: "Jul", income: 41000, expenses: 22100 },
  { month: "Aug", income: 45000, expenses: 27900 },
  { month: "Sep", income: 43500, expenses: 24800 },
  { month: "Oct", income: 48500, expenses: 15499 }
];
const initialBudgets = [
  { name: "Housing", limit: 12000, spent: 10500, color: "#8274ee" },
  { name: "Food & dining", limit: 4000, spent: 2260, color: "#f3b84c" },
  { name: "Transport", limit: 2000, spent: 680, color: "#42b6a0" },
  { name: "Shopping", limit: 2500, spent: 750, color: "#ed8eb4" }
];
const initialGoals = [
  { name: "Emergency fund", target: 50000, saved: 18500, color: "#8274ee", due: "Mar 2027" },
  { name: "New laptop", target: 70000, saved: 28000, color: "#42b6a0", due: "Jun 2027" },
  { name: "Travel fund", target: 25000, saved: 9200, color: "#f3b84c", due: "Feb 2027" }
];

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(value || 0);
const dateLabel = (value) => new Date(value + "T12:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const today = localToday();

function IconBadge({ category, size = 18 }) {
  const style = categoryStyles[category] || categoryStyles.Other;
  const Icon = style.icon;
  return <span className="icon-badge" style={{ background: style.bg, color: style.color }}><Icon size={size} /></span>;
}
function SectionHeading({ eyebrow, title, detail, action }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>;
}
function ProgressBar({ value, color = "#8274ee" }) {
  return <div className="progress-track"><span style={{ width: Math.min(100, Math.max(0, value)) + "%", background: color }} /></div>;
}

export default function App() {
  const [page, setPage] = useState("Overview");
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sbt-transactions")) || initialTransactions; }
    catch { return initialTransactions; }
  });
  const [budgets, setBudgets] = useState(() => { try { return JSON.parse(localStorage.getItem("sbt-budgets")) || initialBudgets; } catch { return initialBudgets; } });
  const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem("sbt-goals")) || initialGoals; } catch { return initialGoals; } });
  const [showAdd, setShowAdd] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ title: "", amount: "", type: "expense", category: "Food & dining", date: today, method: "UPI", note: "", need: "Need" });
  const [calculatorValue, setCalculatorValue] = useState("2500");
  const [splitPeople, setSplitPeople] = useState("4");

  useEffect(() => { localStorage.setItem("sbt-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("sbt-budgets", JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem("sbt-goals", JSON.stringify(goals)); }, [goals]);

  const totals = useMemo(() => transactions.reduce((acc, item) => {
    if (item.type === "income") acc.income += Number(item.amount);
    else acc.expenses += Number(item.amount);
    return acc;
  }, { income: 0, expenses: 0 }), [transactions]);
  const balance = totals.income - totals.expenses;
  const monthTransactions = transactions.filter((t) => t.date.slice(0, 7) === today.slice(0, 7));
  const monthExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const actualSpending = useMemo(() => {
    const totalsByCategory = monthTransactions.filter(t => t.type === "expense").reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc; }, {});
    const palette = ["#8274ee", "#f3b84c", "#42b6a0", "#ed8eb4", "#8b9bb1", "#5d9cec", "#e47767"];
    return Object.entries(totalsByCategory).sort((a,b)=>b[1]-a[1]).map(([name,value],i)=>({name,value,color:palette[i%palette.length]}));
  }, [monthTransactions]);
  const actualTrendData = useMemo(() => Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5-i));
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const monthItems = transactions.filter(t=>t.date.slice(0,7)===key);
    return { month:d.toLocaleDateString("en-IN",{month:"short"}), income:monthItems.filter(t=>t.type==="income").reduce((sum,t)=>sum+Number(t.amount),0), expenses:monthItems.filter(t=>t.type==="expense").reduce((sum,t)=>sum+Number(t.amount),0) };
  }), [transactions]);
  const budgetsWithSpend = budgets.map(b => ({...b, spent: monthTransactions.filter(t=>t.type==="expense" && t.category===b.name).reduce((sum,t)=>sum+Number(t.amount),0)}));
  const filteredTransactions = transactions.filter((t) => {
    const matchesQuery = (t.title + " " + t.category + " " + (t.note || "")).toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filterType === "all" || t.type === filterType);
  }).sort((a, b) => b.date.localeCompare(a.date));

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const addTransaction = (event) => {
    event.preventDefault();
    const amount = Math.round(Number(form.amount) * 100) / 100;
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      notify("Add a description and a valid amount.");
      return;
    }
    setTransactions((current) => [{ ...form, id: Date.now(), amount, title: form.title.trim() }, ...current]);
    setShowAdd(false);
    setForm({ title: "", amount: "", type: "expense", category: "Food & dining", date: localToday(), method: "UPI", note: "", need: "Need" });
    notify("Transaction added.");
  };
  const exportCSV = () => {
    const header = ["Date", "Description", "Type", "Category", "Amount", "Payment method", "Need/Want", "Note"];
    const rows = transactions.map((t) => [t.date, t.title, t.type, t.category, t.amount, t.method, t.need, t.note || ""]);
    const csv = [header, ...rows].map((row) => row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "smart-budget-transactions.csv"; link.click();
    URL.revokeObjectURL(url);
    notify("CSV export prepared.");
  };

  const navGroups = [
    { label: "WORKSPACE", items: [{ name: "Overview", icon: Home }, { name: "Transactions", icon: ArrowLeftRight }, { name: "Budgets", icon: Wallet }, { name: "Savings goals", icon: Target }] },
    { label: "YOUR MONEY", items: [{ name: "Analytics", icon: TrendingUp }, { name: "Smart insights", icon: Sparkles }, { name: "Calculator", icon: Calculator }] },
    { label: "PREFERENCES", items: [{ name: "Settings", icon: Settings2 }, { name: "Help & support", icon: CircleHelp }] }
  ];
  const changePage = (name) => { setPage(name); setMobileNav(false); };

  return <div className="app-shell">
    {mobileNav && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
    <aside className={"sidebar " + (mobileNav ? "sidebar-open" : "")}>
      <div className="brand"><div className="brand-mark"><Wallet size={21} /></div><div><strong>SmartBudget</strong><small>MONEY, MADE CLEAR</small></div><button className="close-nav icon-button" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="profile-switch"><div className="avatar">AS</div><span><strong>Personal account</strong><small>Everyday finances</small></span><ChevronDown size={16} /></button>
      <div className="nav-scroll">{navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map((item) => <button key={item.name} className={"nav-item " + (page === item.name ? "active" : "")} onClick={() => changePage(item.name)}><item.icon size={18} strokeWidth={1.8} /><span>{item.name}</span>{item.name === "Smart insights" && <span className="new-dot" />}</button>)}</div>)}</div>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17} /></div><strong>Make your money work smarter</strong><p>Small steps today, more freedom tomorrow.</p><button onClick={() => changePage("Smart insights")}>Explore insights <ArrowUpRight size={14} /></button></div><button className="nav-item"><LogOut size={18} /><span>Sign out</span></button><div className="sidebar-foot"><ShieldCheck size={14} /> Your money, your decisions</div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div></div><div className="topbar-actions"><div className="date-chip"><CalendarDays size={15} /> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You're all caught up.")}><Bell size={18} /><i /></button><div className="top-avatar">AS</div></div></header>

      <div className="page-content">
        {page === "Overview" && <><div className="welcome-row"><div><div className="eyebrow">YOUR FINANCIAL SNAPSHOT</div><h1>Good evening <span className="wave">✦</span></h1><p>Here's how your money is doing. One step at a time.</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add transaction</button></div>
          <div className="summary-grid">
            <div className="summary-card balance-card"><div className="summary-top"><span>Total balance</span><span className="summary-icon violet"><Wallet size={18} /></span></div><div className="summary-amount">{money(balance)}</div><div className="summary-foot"><span className="trend-pill"><TrendingUp size={13} /> Rolling balance</span><span className="muted">All recorded activity</span></div><div className="balance-spark"><svg viewBox="0 0 300 42" preserveAspectRatio="none"><path d="M0 34 C25 30,35 37,56 24 S90 29,112 15 S145 28,169 17 S202 23,222 8 S260 18,300 2" fill="none" stroke="#b9adff" strokeWidth="2.5" /></svg></div></div>
            <div className="summary-card"><div className="summary-top"><span>Income this month</span><span className="summary-icon green"><ArrowDownLeft size={18} /></span></div><div className="summary-amount">{money(monthIncome)}</div><div className="summary-foot"><span className="metric-note positive"><ArrowDownLeft size={13} /> Money in</span><span className="muted">October</span></div><div className="mini-progress"><span className="income-progress" /></div></div>
            <div className="summary-card"><div className="summary-top"><span>Spent this month</span><span className="summary-icon orange"><ArrowUpRight size={18} /></span></div><div className="summary-amount">{money(monthExpenses)}</div><div className="summary-foot"><span className="metric-note neutral">Across all categories</span><span className="muted">October</span></div><div className="mini-progress"><span className="expense-progress" /></div></div>
            <div className="summary-card"><div className="summary-top"><span>Savings goals</span><span className="summary-icon pink"><PiggyBank size={18} /></span></div><div className="summary-amount">{money(goals.reduce((s, g) => s + g.saved, 0))}</div><div className="summary-foot"><span className="metric-note positive"><Target size={13} /> {Math.round(goals.reduce((s,g)=>s+g.saved,0)/goals.reduce((s,g)=>s+g.target,0)*100)}% of target</span><span className="muted">{goals.length} active goals</span></div><div className="mini-progress"><span className="goal-progress" /></div></div>
          </div>
          <div className="dashboard-grid"><section className="panel trend-panel"><div className="panel-heading"><div><h3>Income vs expenses</h3><p>Your money movement over time</p></div><button className="select-chip" onClick={() => changePage("Analytics")}>Last 6 months <ChevronDown size={14} /></button></div><div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div><div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={actualTrendData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8374ee" stopOpacity={0.18} /><stop offset="95%" stopColor="#8374ee" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#50b8a3" stopOpacity={0.16} /><stop offset="95%" stopColor="#50b8a3" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eef0f6" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#929bb0", fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#929bb0", fontSize: 11 }} tickFormatter={(v) => v/1000 + "k"} /><Tooltip formatter={(value) => money(value)} contentStyle={{ border: "1px solid #e9eaf2", borderRadius: 12, fontSize: 12 }} /><Area type="monotone" dataKey="income" name="Income" stroke="#8274ee" strokeWidth={2.5} fill="url(#incomeFill)" /><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#50b8a3" strokeWidth={2.5} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer></div><div className="chart-footnote"><span><span className="footnote-dot" /> October is based on recorded transactions</span><button onClick={() => changePage("Analytics")}>View analytics <ArrowUpRight size={14} /></button></div></section>
            <section className="panel spending-panel"><div className="panel-heading"><div><h3>Spending breakdown</h3><p>Where your money goes</p></div><button className="more-button" aria-label="More spending options" onClick={() => changePage("Analytics")}><MoreHorizontal size={20} /></button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={actualSpending} dataKey="value" nameKey="name" innerRadius={66} outerRadius={88} paddingAngle={3} stroke="none">{actualSpending.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => money(value)} /></PieChart></ResponsiveContainer><div className="donut-center"><span>Total expenses</span><strong>{money(actualSpending.reduce((s, x) => s + x.value, 0))}</strong><small>This month</small></div></div><div className="category-legend">{actualSpending.map((item) => <div className="category-line" key={item.name}><span className="category-name"><i style={{ background: item.color }} />{item.name}</span><strong>{money(item.value)}</strong></div>)}</div><button className="full-link" onClick={() => changePage("Analytics")}>Explore spending <ArrowUpRight size={14} /></button></section>
          </div>
          <div className="lower-grid"><section className="panel transactions-panel"><div className="panel-heading"><div><h3>Recent transactions</h3><p>Your latest money movement</p></div><button className="text-button" onClick={() => changePage("Transactions")}>View all <ArrowUpRight size={14} /></button></div><TransactionList transactions={transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)} /></section><section className="panel budget-panel"><div className="panel-heading"><div><h3>Monthly budgets</h3><p>Keep spending on track</p></div><button className="text-button" onClick={() => changePage("Budgets")}>See all <ArrowUpRight size={14} /></button></div><div className="budget-list">{budgetsWithSpend.slice(0,4).map((b) => <div className="budget-row" key={b.name}><div className="budget-row-top"><span><IconBadge category={b.name} size={15} />{b.name}</span><small>{money(b.spent)} <em>of {money(b.limit)}</em></small></div><ProgressBar value={b.spent/b.limit*100} color={b.color} /><div className="budget-row-bottom"><span>{Math.round(b.spent/b.limit*100)}% used</span><span>{money(b.limit-b.spent)} left</span></div></div>)}</div></section></div>
          <div className="insight-banner"><div className="insight-symbol"><Sparkles size={20} /></div><div><strong>A little insight goes a long way</strong><p>Your current recorded spending is {monthIncome > 0 ? Math.round(monthExpenses/monthIncome*100) : 0}% of this month's recorded income. Keep an eye on your planned bills and savings allocations, too.</p></div><button onClick={() => changePage("Smart insights")}>See insights <ArrowUpRight size={15} /></button></div>
        </>}

        {page === "Transactions" && <><SectionHeading eyebrow="MONEY MOVEMENT" title="Transactions" detail="Every inflow and outflow, in one place." action={<div className="heading-actions"><button className="secondary-button" onClick={exportCSV}><Download size={16} /> Export CSV</button><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add transaction</button></div>} /><section className="panel table-panel"><div className="table-tools"><div className="search-box"><Search size={16} /><input placeholder="Search transactions..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="filter-select"><Filter size={15} /><select value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></div></div><TransactionList transactions={filteredTransactions} showNotes emptyMessage="No transactions match your search." onDelete={(id) => { if (confirm("Delete this transaction? This cannot be undone.")) { setTransactions(all => all.filter(t => t.id !== id)); notify("Transaction deleted."); } }} /></section></>}

        {page === "Budgets" && <><SectionHeading eyebrow="PLAN WITH PURPOSE" title="Monthly budgets" detail="Set spending limits and know where you stand." action={<button className="primary-button" onClick={() => { const name = prompt("Budget category name?"); if (!name?.trim()) return; const limit = Number(prompt("Monthly limit in ₹?")); if (limit > 0) setBudgets((b) => [...b, { name: name.trim(), limit, spent: 0, color: "#8274ee" }]); }}> <Plus size={17} /> Add budget</button>} /><div className="budget-summary-row"><div className="summary-card"><span className="card-caption">Total planned</span><strong className="large-number">{money(budgets.reduce((s,b)=>s+b.limit,0))}</strong></div><div className="summary-card"><span className="card-caption">Recorded spending</span><strong className="large-number">{money(budgets.reduce((s,b)=>s+b.spent,0))}</strong></div><div className="summary-card"><span className="card-caption">Budget remaining</span><strong className="large-number">{money(budgets.reduce((s,b)=>s+Math.max(0,b.limit-b.spent),0))}</strong></div></div><div className="budget-card-grid">{budgetsWithSpend.map((b) => <div className="panel budget-detail" key={b.name}><div className="budget-detail-head"><IconBadge category={b.name} size={19} /><button className="more-button" onClick={() => { const limit = Number(prompt("New monthly limit in ₹?", String(b.limit))); if (limit > 0) setBudgets((all)=>all.map((x)=>x.name===b.name?{...x,limit}:x)); }} aria-label={"Edit "+b.name+" budget"}><Ellipsis size={18} /></button></div><h3>{b.name}</h3><div className="budget-numbers"><strong>{money(b.spent)}</strong><span>of {money(b.limit)}</span></div><ProgressBar value={b.spent/b.limit*100} color={b.color} /><div className="budget-row-bottom"><span>{Math.round(b.spent/b.limit*100)}% used</span><span>{money(Math.max(0,b.limit-b.spent))} left</span></div>{b.spent/b.limit>=.85 && <div className="budget-alert"><Bell size={14} /> {b.spent/b.limit>=1 ? "Budget limit reached" : "You're nearing this budget"}</div>}</div>)}</div></>}

        {page === "Savings goals" && <><SectionHeading eyebrow="FUTURE YOU WILL THANK YOU" title="Savings goals" detail="Give your money a destination." action={<button className="primary-button" onClick={() => { const name=prompt("What are you saving for?"); if(!name?.trim())return; const target=Number(prompt("Target amount in ₹?")); if(target>0)setGoals((g)=>[...g,{name:name.trim(),target,saved:0,color:"#8274ee",due:"Not set"}]); }}><Plus size={17} /> Create a goal</button>} /><div className="goals-intro"><div className="goal-total-icon"><PiggyBank size={23} /></div><div><span>Total saved toward goals</span><strong>{money(goals.reduce((s,g)=>s+g.saved,0))}</strong></div><div className="goals-intro-side"><span>Combined target</span><strong>{money(goals.reduce((s,g)=>s+g.target,0))}</strong></div></div><div className="goals-grid">{goals.map((g) => <div className="panel goal-card" key={g.name}><div className="goal-card-top"><div className="goal-art" style={{color:g.color,background:g.color+"18"}}><Target size={23} /></div><button className="more-button" aria-label="Add savings" onClick={()=>{const amount=Number(prompt("How much would you like to allocate to this goal? (₹)"));if(amount>0)setGoals((all)=>all.map((x)=>x.name===g.name?{...x,saved:x.saved+amount}:x));}}><Plus size={17}/></button></div><h3>{g.name}</h3><p className="goal-due">Target date · {g.due}</p><div className="goal-amounts"><strong>{money(g.saved)}</strong><span>of {money(g.target)}</span></div><ProgressBar value={g.saved/g.target*100} color={g.color}/><div className="goal-bottom"><span>{Math.min(100,Math.round(g.saved/g.target*100))}% complete</span><span>{money(Math.max(0,g.target-g.saved))} to go</span></div></div>)}</div><p className="helper-note"><ShieldCheck size={15}/> Goal allocations shown here are planning entries; they do not move money between real bank accounts.</p></>}

        {page === "Analytics" && <><SectionHeading eyebrow="SEE THE BIGGER PICTURE" title="Your analytics" detail="Understand patterns in your recorded money activity." action={<button className="secondary-button" onClick={exportCSV}><Download size={16}/> Export data</button>} /><div className="summary-grid analytics-summary"><div className="summary-card"><span className="card-caption">Total income recorded</span><strong className="large-number">{money(totals.income)}</strong><span className="muted">All dates in this device's data</span></div><div className="summary-card"><span className="card-caption">Total expenses recorded</span><strong className="large-number">{money(totals.expenses)}</strong><span className="muted">All dates in this device's data</span></div><div className="summary-card"><span className="card-caption">Net balance</span><strong className="large-number">{money(balance)}</strong><span className="muted">Income minus expenses</span></div></div><div className="panel analytics-chart-panel"><div className="panel-heading"><div><h3>Six-month trend</h3><p>Calculated from transactions recorded in this browser</p></div><span className="demo-chip">Live local data</span></div><div className="large-trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{top:12,right:16,left:0,bottom:0}}><CartesianGrid stroke="#eef0f6" strokeDasharray="4 4" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={(v)=>v/1000+"k"}/><Tooltip formatter={(v)=>money(v)}/><Area type="monotone" dataKey="income" stroke="#8274ee" fill="#8274ee20" strokeWidth={2.5}/><Area type="monotone" dataKey="expenses" stroke="#42b6a0" fill="#42b6a020" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></div></div><div className="insight-banner"><Lightbulb size={21}/><div><strong>How to make these insights more useful</strong><p>Record transactions consistently. Historical trends and forecasts should be calculated from your own saved records, not sample values.</p></div></div></>}

        {page === "Smart insights" && <><SectionHeading eyebrow="THOUGHTFUL MONEY HABITS" title="Smart insights" detail="Helpful prompts based on the records currently available." /><div className="insight-cards"><div className="panel insight-card"><div className="insight-card-icon lavender"><Activity size={20}/></div><span className="insight-tag">SPENDING PACE</span><h3>Check your daily pace</h3><p>Your recorded expenses this month are {money(monthExpenses)}. Divide this by the number of days elapsed to understand your current average; compare it with your remaining flexible budget.</p><div className="insight-metric"><span>Average per elapsed day</span><strong>{money(monthExpenses/Math.max(1,new Date().getDate()))}</strong></div></div><div className="panel insight-card"><div className="insight-card-icon mint"><ShieldCheck size={20}/></div><span className="insight-tag">BUDGET CHECK</span><h3>Catch budget drift early</h3><p>Budgets at 85% utilization are worth reviewing before the month ends. This is a rule-based reminder, not a prediction.</p><div className="insight-metric"><span>Budgets at or above 85%</span><strong>{budgetsWithSpend.filter(b=>b.limit>0 && b.spent/b.limit>=.85).length}</strong></div></div><div className="panel insight-card"><div className="insight-card-icon peach"><Target size={20}/></div><span className="insight-tag">GOAL MOMENTUM</span><h3>Keep goals visible</h3><p>Small, regular contributions can make a long-term target easier to manage. Set a contribution cadence that fits your cash flow.</p><div className="insight-metric"><span>Active savings goals</span><strong>{goals.length}</strong></div></div><div className="panel insight-card"><div className="insight-card-icon blue"><Sparkles size={20}/></div><span className="insight-tag">NEXT STEP</span><h3>Build your own history</h3><p>Forecasts and unusual-spending detection need enough dated personal records. The current demo does not claim a trained machine-learning model.</p><button className="secondary-button" onClick={()=>changePage("Transactions")}>Review transactions <ArrowUpRight size={15}/></button></div></div></>}

        {page === "Calculator" && <><SectionHeading eyebrow="PLAN BEFORE YOU SPEND" title="Money calculator" detail="Quick calculations for everyday decisions."/><div className="calculator-grid"><div className="panel calculator-panel"><div className="calculator-icon"><Calculator size={22}/></div><h3>Split a bill</h3><p>Work out an equal share before you pay.</p><label>Total bill amount (₹)<input type="number" min="0" value={calculatorValue} onChange={e=>setCalculatorValue(e.target.value)}/></label><label>Number of people<input type="number" min="1" value={splitPeople} onChange={e=>setSplitPeople(e.target.value)}/></label><div className="calculator-result"><span>Each person's share</span><strong>{money(Number(calculatorValue||0)/Math.max(1,Number(splitPeople||4)))}</strong></div><small>Equal split only; tips and unequal shares are not included.</small></div><div className="panel calculator-panel"><div className="calculator-icon mint"><CircleDollarSign size={22}/></div><h3>Daily spending guide</h3><p>Estimate a daily amount from your flexible money.</p><div className="calculator-static"><span>Available flexible money</span><strong>{money(Math.max(0,balance))}</strong></div><div className="calculator-static"><span>Days left in this month</span><strong>{new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()-new Date().getDate()+1}</strong></div><div className="calculator-result"><span>Simple daily ceiling</span><strong>{money(Math.max(0,balance)/(new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()-new Date().getDate()+1))}</strong></div><small>Planning estimate only; subtract protected savings and unpaid bills before relying on this amount.</small></div></div></>}

        {page === "Settings" && <><SectionHeading eyebrow="YOUR PREFERENCES" title="Settings" detail="Manage this demo's local preferences and data."/><div className="settings-grid"><div className="panel settings-card"><div className="settings-icon"><ShieldCheck size={20}/></div><h3>Data & privacy</h3><p>Transaction records currently save in this browser using local storage. They are not synced across devices or protected by account login yet.</p><button className="secondary-button" onClick={exportCSV}><Download size={16}/> Back up as CSV</button></div><div className="panel settings-card"><div className="settings-icon"><Receipt size={20}/></div><h3>Demo data</h3><p>Reset your transaction list to the initial example records. This replaces the records saved in this browser.</p><button className="danger-button" onClick={()=>{if(confirm("Reset transactions to the original sample records?")){setTransactions(initialTransactions);notify("Sample transactions restored.");}}}>Restore sample transactions</button></div></div></>}

        {page === "Help & support" && <><SectionHeading eyebrow="WE'RE HERE TO HELP" title="Help & support" detail="A few important notes about this early build."/><div className="panel faq-panel">{[["Where is my data stored?","This prototype stores transactions in this browser only. Clearing browser data can erase them. Account login, cloud backup and multi-device sync are not implemented yet."],["Are the charts and insights live?","The dashboard totals use the transactions stored in this browser. Some category breakdown and six-month chart values are illustrative sample data and are clearly identified as such in Analytics."],["Does this connect to my bank?","No. Transactions are entered manually; no bank account or payment provider is connected."],["Are the predictions powered by machine learning?","Not in this prototype. It currently shows transparent rule-based prompts. Forecasting should be added only after data validation and testing."],["Can I export my records?","Use Export CSV from the Transactions or Analytics screen. Treat exported files as sensitive financial information."]].map(([q,a])=><details className="faq-item" key={q}><summary>{q}<ChevronDown size={17}/></summary><p>{a}</p></details>)}</div></>}
      </div>
      <footer className="app-footer"><span>SmartBudget <span className="footer-separator">·</span> Smart Budget Tracker</span><span><ShieldCheck size={13}/> Your financial data deserves care</span></footer>
    </main>

    {showAdd && <div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)setShowAdd(false);}}><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">KEEP YOUR RECORDS CURRENT</span><h2 id="modal-title">Add transaction</h2></div><button className="icon-button" onClick={()=>setShowAdd(false)} aria-label="Close dialog"><X size={20}/></button></div><form onSubmit={addTransaction}><div className="type-toggle"><button type="button" className={form.type==="expense"?"selected expense-selected":""} onClick={()=>setForm({...form,type:"expense",category:"Food & dining"})}><ArrowUpRight size={16}/> Expense</button><button type="button" className={form.type==="income"?"selected income-selected":""} onClick={()=>setForm({...form,type:"income",category:"Salary"})}><ArrowDownLeft size={16}/> Income</button></div><label>Description<input autoFocus required placeholder="e.g. Grocery shopping" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="form-two-col"><label>Amount (₹)<input required type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Date<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div><div className="form-two-col"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{(form.type==="income"?["Salary","Freelance","Scholarship","Gift","Other"]:["Food & dining","Housing","Transport","Shopping","Health","Education","Entertainment","Bills","Other"]).map(c=><option key={c}>{c}</option>)}</select></label><label>Payment method<select value={form.method} onChange={e=>setForm({...form,method:e.target.value})}>{["UPI","Cash","Card","Bank transfer","Other"].map(m=><option key={m}>{m}</option>)}</select></label></div><label>Type of spending<select value={form.need} onChange={e=>setForm({...form,need:e.target.value})}><option>Need</option><option>Want</option><option>Unclassified</option></select></label><label>Note (optional)<textarea rows="2" placeholder="Add a little context..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowAdd(false)}>Cancel</button><button type="submit" className="primary-button"><Check size={16}/> Save transaction</button></div><p className="modal-disclaimer"><ShieldCheck size={13}/> Saved locally in this browser on this device.</p></form></section></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

function TransactionList({ transactions, showNotes = false, emptyMessage = "No transactions yet. Add your first transaction to get started.", onDelete }) {
  if (!transactions.length) return <div className="empty-state"><Receipt size={25}/><strong>No transactions found</strong><p>{emptyMessage}</p></div>;
  return <div className="transaction-list">{transactions.map((t) => <div className="transaction-row" key={t.id}><IconBadge category={t.category}/><div className="transaction-main"><strong>{t.title}</strong><span>{t.category} <i>·</i> {dateLabel(t.date)}{showNotes && t.note ? " · "+t.note : ""}</span></div><div className="transaction-amount"><strong className={t.type==="income"?"amount-income":"amount-expense"}>{t.type==="income"?"+":"−"}{money(t.amount)}</strong><span>{t.method}</span></div>{onDelete && <button className="delete-transaction" aria-label={`Delete ${t.title}`} title="Delete transaction" onClick={()=>onDelete(t.id)}><X size={15}/></button>}</div>)}</div>;
}
