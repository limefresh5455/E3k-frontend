import { useState, useEffect, useCallback } from "react";

const RAW_API = import.meta.env.VITE_API_URL || "https://api.ssb-rocket.ch";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
const API_BASE = RAW_API.replace(/\/api\/?$/, "");

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
};

const uploadMonthlyInvoicePdf = async (file) => {
  const token = localStorage.getItem("token");
  const body = new FormData();
  body.append("file", file);
  const endpoints = [
    `${API_BASE}/invoice/parse-groups`,
    `${API_BASE}/api/invoice/parse-groups`,
    `${RAW_API}/invoice/parse-groups`,
    `${RAW_API}/api/invoice/parse-groups`,
  ];

  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body,
        headers: {
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const err = await res.json();
          message = err?.detail || message;
        } catch {
          // ignore non-json error body
        }
        lastErr = new Error(message);
        continue;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `monthly_invoice_${Date.now()}.pdf`;
      return { blob, filename };
    } catch (err) {
      lastErr = err;
    }
  }

  if (lastErr instanceof TypeError) {
    throw new Error("Failed to fetch. Check backend URL/CORS and ensure the API server is running.");
  }
  throw lastErr || new Error("Upload failed.");
};

const Icon = {
  Package:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  XCircle:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Building:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M15 9h3"/><path d="M15 15h3"/></svg>,
  Refresh:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Calendar:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  ExternalLink:() => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Search:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Logout:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Close:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Hash:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Folder:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Layers:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Upload:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
};

function useAuth() {
  const [user, setUser] = useState(() => localStorage.getItem("username"));
  const login = async (username, password) => {
    const data = await apiFetch("/login", { method: "POST", body: JSON.stringify({ username, password }) });
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    setUser(data.username);
  };
  const logout = () => { localStorage.clear(); setUser(null); };
  return { user, login, logout };
}

function PublicTabs({ active, onSelect }) {
  return (
    <div style={{ display: "flex", gap: "0.375rem", background: "#f1f5f9", borderRadius: "0.625rem", padding: "0.25rem", marginBottom: "1.25rem" }}>
      {[
        ["login", "Sign In"],
        ["monthly-invoice", "Monthly Invoice"],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          style={{
            flex: 1,
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: "pointer",
            background: active === key ? "#0f172a" : "transparent",
            color: active === key ? "#fff" : "#64748b",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function LoginPage({ onLogin, onOpenMonthlyInvoice }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await onLogin(form.username, form.password); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  const inp = { border:"1.5px solid #e2e8f0", borderRadius:"0.625rem", padding:"0.625rem 0.875rem", fontSize:"0.9rem", outline:"none", width:"100%", boxSizing:"border-box" };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1e293b,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#fff",borderRadius:"1.25rem",boxShadow:"0 25px 50px rgba(0,0,0,.35)",width:"100%",maxWidth:"400px",padding:"2.5rem"}}>
        <PublicTabs active="login" onSelect={(tab) => { if (tab === "monthly-invoice") onOpenMonthlyInvoice(); }} />
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:"52px",height:"52px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem"}}>
            <div style={{width:"26px",height:"26px",color:"#fff"}}><Icon.Layers /></div>
          </div>
          <h1 style={{fontSize:"1.5rem",fontWeight:700,color:"#0f172a",margin:0}}>E3k</h1>
          <p style={{color:"#64748b",fontSize:"0.875rem",marginTop:"0.25rem"}}>Sign in to your workspace</p>
        </div>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {[["username","text","admin"],["password","password","••••••••"]].map(([f,t,ph]) => (
            <div key={f}>
              <label style={{display:"block",fontSize:"0.8125rem",fontWeight:600,color:"#374151",marginBottom:"0.375rem",textTransform:"capitalize"}}>{f}</label>
              <input type={t} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} placeholder={ph} required style={inp}
                onFocus={e=>e.target.style.borderColor="#3b82f6"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
            </div>
          ))}
          {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"0.5rem",padding:"0.625rem 0.875rem",color:"#dc2626",fontSize:"0.85rem"}}>{error}</div>}
          <button type="submit" disabled={loading} style={{background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:"0.625rem",padding:"0.75rem",fontWeight:700,fontSize:"0.9rem",cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,marginTop:"0.25rem"}}>
            {loading?"Signing in…":"Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MonthlyInvoicePage({ onOpenLogin }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    setLoading(true);
    try {
      const { blob, filename } = await uploadMonthlyInvoicePdf(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccess(`Generated successfully: ${filename}`);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e293b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "1.25rem", boxShadow: "0 25px 50px rgba(0,0,0,.35)", width: "100%", maxWidth: "560px", padding: "2rem" }}>
        <PublicTabs active="monthly-invoice" onSelect={(tab) => { if (tab === "login") onOpenLogin(); }} />
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Monthly Invoice</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.35rem" }}>
            Upload a source PDF and download the generated invoice PDF.
          </p>
        </div>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>PDF File</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", padding: "0.625rem 0.75rem", fontSize: "0.9rem", background: "#fff" }}
          />
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", color: "#dc2626", fontSize: "0.85rem" }}>{error}</div>}
          {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", color: "#166534", fontSize: "0.85rem" }}>{success}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.75rem", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: "0.25rem" }}
          >
            {loading ? "Generating PDF..." : "Upload & Generate PDF"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({label,value,icon,color,bg}) {
  return (
    <div style={{background:"#fff",borderRadius:"1rem",padding:"1.25rem 1.5rem",boxShadow:"0 1px 3px rgba(0,0,0,.07)",border:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:"1rem"}}>
      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <div style={{width:"22px",height:"22px",color}}>{icon}</div>
      </div>
      <div>
        <p style={{fontSize:"0.75rem",color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:0}}>{label}</p>
        <p style={{fontSize:"1.75rem",fontWeight:800,color:"#0f172a",margin:"0.125rem 0 0",lineHeight:1}}>{value??0}</p>
      </div>
    </div>
  );
}

function Badge({status}) {
  const m={success:{bg:"#dcfce7",color:"#16a34a",t:"Success"},failure:{bg:"#fee2e2",color:"#dc2626",t:"Failed"},pending:{bg:"#fef9c3",color:"#ca8a04",t:"Pending"},skipped:{bg:"#f1f5f9",color:"#64748b",t:"Skipped"}};
  const s=m[status]||m.pending;
  return <span style={{background:s.bg,color:s.color,fontSize:"0.7rem",fontWeight:700,padding:"0.2rem 0.6rem",borderRadius:"999px",letterSpacing:"0.04em"}}>{s.t.toUpperCase()}</span>;
}

function Spinner({size=32}) {
  return <div style={{width:size,height:size,border:`${size/8}px solid #e2e8f0`,borderTop:`${size/8}px solid #3b82f6`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />;
}

const asNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim().replace(/\s+/g, "").replace(/'/g, "");
  const normalized = text.includes(",") && !text.includes(".")
    ? text.replace(",", ".")
    : text.replace(/,/g, "");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
};

function OrderCard({order,onClick}) {
  const s=order.summary||{};
  const needsDoubleCheck = Boolean(s.requires_double_check);
  const rawAlerts = Array.isArray(s.alerts) ? s.alerts : [];
  const hasUnit = rawAlerts.some(a => a?.type === "unit_factor");
  const hasDelivery = rawAlerts.some(a => a?.type === "delivery_date_gt_one_week");
  const normalizedAlerts = hasDelivery && !hasUnit
    ? [{ type: "unit_factor", message: "Double-check required: Unit price conversion." }, ...rawAlerts]
    : rawAlerts;
  const summaryAlerts = [
    ...normalizedAlerts.filter(a => a?.type === "unit_factor"),
    ...normalizedAlerts.filter(a => a?.type === "delivery_date_gt_one_week"),
    ...normalizedAlerts.filter(a => a?.type !== "unit_factor" && a?.type !== "delivery_date_gt_one_week"),
  ];
  const ok=order.status==="success", fail=order.status==="failure";
  return (
    <div onClick={onClick} style={{background:"#fff",borderRadius:"1rem",border:`1.5px solid ${fail?"#fecaca":"#f1f5f9"}`,boxShadow:"0 1px 3px rgba(0,0,0,.06)",cursor:"pointer",padding:"1.25rem",transition:"all .15s",position:"relative",overflow:"hidden"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.12)";e.currentTarget.style.transform="translateY(-2px)"}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.06)";e.currentTarget.style.transform="none"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:ok?"linear-gradient(90deg,#22c55e,#16a34a)":fail?"linear-gradient(90deg,#ef4444,#dc2626)":"#e2e8f0",borderRadius:"1rem 1rem 0 0"}} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.875rem"}}>
        <div style={{flex:1,minWidth:0,marginRight:"0.5rem"}}>
          <p style={{fontSize:"1rem",fontWeight:700,color:"#0f172a",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{order.order_number?`#${order.order_number}`:"No Order #"}</p>
          <p style={{fontSize:"0.75rem",color:"#94a3b8",margin:"0.125rem 0 0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{order.file_name}</p>
        </div>
        <Badge status={order.status} />
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
        <div style={{width:"14px",height:"14px",color:"#94a3b8",flexShrink:0}}><Icon.Building /></div>
        <span style={{fontSize:"0.8125rem",color:"#475569",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{order.supplier||s.supplier||"Unknown supplier"}</span>
      </div>
      {s.delivery_date&&<div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
        <div style={{width:"14px",height:"14px",color:"#94a3b8",flexShrink:0}}><Icon.Calendar /></div>
        <span style={{fontSize:"0.8125rem",color:"#475569"}}>Delivery: <strong>{s.delivery_date}</strong></span>
      </div>}
      {ok&&s.line_count>0&&<div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
        <div style={{width:"14px",height:"14px",color:"#94a3b8",flexShrink:0}}><Icon.Hash /></div>
        <span style={{fontSize:"0.8125rem",color:"#475569"}}>{s.line_count} line{s.line_count!==1?"s":""} &nbsp;·&nbsp; {s.currency} {s.total_net?.toFixed(2)}</span>
      </div>}
      {ok&&needsDoubleCheck&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:"0.5rem",padding:"0.5rem 0.625rem",marginTop:"0.5rem"}}>
        {(summaryAlerts.length ? summaryAlerts : [{ message: "Double-check required." }]).map((a, i) => (
          <p key={i} style={{fontSize:"0.75rem",color:"#92400e",margin:i===0?0:"0.25rem 0 0",fontWeight:700}}>
            {`${i + 1}. ${a?.message || "Double-check required."}`}
          </p>
        ))}
      </div>}
      {fail&&<div style={{background:"#fef2f2",borderRadius:"0.5rem",padding:"0.5rem 0.625rem",marginTop:"0.5rem"}}>
        <p style={{fontSize:"0.75rem",color:"#dc2626",margin:0,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{order.error_message}</p>
      </div>}
      <div style={{marginTop:"0.875rem",paddingTop:"0.75rem",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.375rem"}}>
          <div style={{width:"12px",height:"12px",color:"#cbd5e1"}}><Icon.Folder /></div>
          <span style={{fontSize:"0.7rem",color:"#94a3b8"}}>{s.folder||order.folder_name||"—"}</span>
        </div>
        <span style={{fontSize:"0.7rem",color:"#cbd5e1"}}>{order.processed_at?new Date(order.processed_at).toLocaleDateString("de-CH"):""}</span>
      </div>
    </div>
  );
}

function SyncPanel({result,onClose}) {
  if(!result)return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"1rem"}}>
      <div style={{background:"#fff",borderRadius:"1.25rem",width:"100%",maxWidth:"520px",maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,.25)"}}>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontSize:"1.1rem",fontWeight:700,color:"#0f172a"}}>Sync Complete</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",width:"28px",height:"28px"}}><Icon.Close /></button>
        </div>
        <div style={{padding:"1.25rem 1.5rem",overflowY:"auto",flex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem",marginBottom:"1.25rem"}}>
            {[["Found",result.total_found,"#3b82f6"],["Processed",result.processed,"#8b5cf6"],["Skipped",result.skipped,"#64748b"],["Success",result.success,"#22c55e"],["Failed",result.failure,"#ef4444"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#f8fafc",borderRadius:"0.75rem",padding:"0.75rem",textAlign:"center"}}>
                <p style={{fontSize:"0.7rem",color:"#94a3b8",fontWeight:600,textTransform:"uppercase",margin:"0 0 0.25rem"}}>{l}</p>
                <p style={{fontSize:"1.5rem",fontWeight:800,color:c,margin:0}}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {result.details?.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#f8fafc",borderRadius:"0.5rem",padding:"0.625rem 0.875rem"}}>
                <span style={{fontSize:"0.8125rem",color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%",marginRight:"0.5rem"}}>{d.file}</span>
                <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexShrink:0}}>
                  {d.order_number&&<span style={{fontSize:"0.75rem",color:"#64748b"}}>#{d.order_number}</span>}
                  <Badge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"1rem 1.5rem",borderTop:"1px solid #f1f5f9"}}>
          <button onClick={onClose} style={{width:"100%",background:"#0f172a",color:"#fff",border:"none",borderRadius:"0.625rem",padding:"0.75rem",fontWeight:700,cursor:"pointer",fontSize:"0.9rem"}}>Close</button>
        </div>
      </div>
    </div>
  );
}

function UploadPdfModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) { setError("Please choose a PDF file."); return; }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body,
        headers: { 
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"1rem"}}>
      <div style={{background:"#fff",borderRadius:"1.25rem",width:"100%",maxWidth:"460px",boxShadow:"0 25px 60px rgba(0,0,0,.25)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontSize:"1.1rem",fontWeight:700,color:"#0f172a"}}>Upload PDF</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",width:"28px",height:"28px"}}><Icon.Close /></button>
        </div>

        <div style={{padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          {!result ? (
            <>
              <div
                style={{border:"2px dashed #e2e8f0",borderRadius:"0.875rem",padding:"2rem",textAlign:"center",background:"#f8fafc",cursor:"pointer"}}
                onClick={() => document.getElementById("upload-pdf-input").click()}
              >
                <div style={{width:"40px",height:"40px",color:"#94a3b8",margin:"0 auto 0.75rem"}}><Icon.Upload /></div>
                <p style={{fontWeight:600,color:"#374151",margin:"0 0 0.25rem",fontSize:"0.9rem"}}>
                  {file ? file.name : "Click to choose a PDF"}
                </p>
                <p style={{fontSize:"0.75rem",color:"#94a3b8",margin:0}}>
                  {file ? `${(file.size/1024).toFixed(1)} KB` : "Only .pdf files accepted"}
                </p>
                <input
                  id="upload-pdf-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{display:"none"}}
                  onChange={e => { setFile(e.target.files?.[0] || null); setError(""); }}
                />
              </div>

              {error && (
                <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"0.5rem",padding:"0.625rem 0.875rem",color:"#dc2626",fontSize:"0.85rem"}}>
                  {error}
                </div>
              )}

              <div style={{display:"flex",gap:"0.75rem"}}>
                <button onClick={onClose} style={{flex:1,background:"none",border:"1.5px solid #e2e8f0",color:"#64748b",borderRadius:"0.625rem",padding:"0.625rem",fontWeight:600,fontSize:"0.875rem",cursor:"pointer"}}>
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  style={{flex:2,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:"0.625rem",padding:"0.625rem",fontWeight:700,fontSize:"0.875rem",cursor:(loading||!file)?"not-allowed":"pointer",opacity:(loading||!file)?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}
                >
                  {loading ? <><Spinner size={16} /> Uploading…</> : "Upload PDF"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"0.875rem",padding:"1.25rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.25rem"}}>
                  <div style={{width:"20px",height:"20px",color:"#16a34a"}}><Icon.CheckCircle /></div>
                  <span style={{fontWeight:700,color:"#166534",fontSize:"0.95rem"}}>Upload Successful</span>
                </div>
                {[
                  ["ERP Record ID", result.erp_record_id],
                ].map(([label, val]) => val && (
                  <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderRadius:"0.5rem",padding:"0.5rem 0.75rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#64748b",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</span>
                    <span style={{fontSize:"0.875rem",fontWeight:700,color:"#0f172a"}}>{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} style={{width:"100%",background:"#0f172a",color:"#fff",border:"none",borderRadius:"0.625rem",padding:"0.75rem",fontWeight:700,cursor:"pointer",fontSize:"0.9rem"}}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderModal({orderId,onClose}) {
  const [order,setOrder]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!orderId)return;
    apiFetch(`/orders/${orderId}`).then(setOrder).finally(()=>setLoading(false));
  },[orderId]);
  if(!orderId)return null;
  const ext=order?.extracted_json;
  const lines=ext?.VoucherLines||[];
  const rawAlerts=order?.summary?.alerts||[];
  const hasUnitAlert = rawAlerts.some(a => a?.type === "unit_factor");
  const hasDeliveryAlert = rawAlerts.some(a => a?.type === "delivery_date_gt_one_week");
  const normalizedAlerts = hasDeliveryAlert && !hasUnitAlert
    ? [{ type: "unit_factor", message: "Double-check required: Unit price conversion." }, ...rawAlerts]
    : rawAlerts;
  const alerts = [
    ...normalizedAlerts.filter(a => a?.type === "unit_factor"),
    ...normalizedAlerts.filter(a => a?.type === "delivery_date_gt_one_week"),
    ...normalizedAlerts.filter(a => a?.type !== "unit_factor" && a?.type !== "delivery_date_gt_one_week"),
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"1rem"}}>
      <div style={{background:"#fff",borderRadius:"1.25rem",width:"100%",maxWidth:"1080px",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,.25)"}}>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <h2 style={{margin:0,fontSize:"1.15rem",fontWeight:700,color:"#0f172a"}}>{order?.order_number?`Order #${order.order_number}`:"Order Detail"}</h2>
              {order&&<Badge status={order.status} />}
            </div>
            <p style={{margin:"0.2rem 0 0",fontSize:"0.8rem",color:"#94a3b8"}}>{order?.file_name}</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",width:"28px",height:"28px"}}><Icon.Close /></button>
        </div>
        <div style={{padding:"1.5rem",overflowY:"auto",flex:1}}>
          {loading&&<div style={{display:"flex",justifyContent:"center",padding:"3rem"}}><Spinner /></div>}
          {!loading&&order?.status==="failure"&&(
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"0.875rem",padding:"1.25rem"}}>
              <p style={{fontWeight:700,color:"#dc2626",margin:"0 0 0.5rem"}}>Processing Failed</p>
              <p style={{fontSize:"0.85rem",color:"#dc2626",fontFamily:"monospace",margin:0,whiteSpace:"pre-wrap"}}>{order.error_message}</p>
            </div>
          )}
          {!loading&&order?.status==="success"&&ext&&(
            <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:"0.75rem"}}>
                {[["Supplier",ext.Supplier],["Order #",ext.OurOrderNumber],["Customer Nr.",ext.CustomerNumber],["Voucher Date",ext.VoucherDate],["Delivery Date",ext.DeliveryDate],["Currency",ext.Currency]].map(([label,val])=>(
                  <div key={label} style={{background:"#f8fafc",borderRadius:"0.75rem",padding:"0.875rem 1rem"}}>
                    <p style={{fontSize:"0.7rem",color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 0.25rem"}}>{label}</p>
                    <p style={{fontSize:"0.875rem",fontWeight:600,color:"#0f172a",margin:0}}>{val||"—"}</p>
                  </div>
                ))}
              </div>
              {order.pdf_url&&<a href={order.pdf_url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#3b82f6",textDecoration:"none",fontSize:"0.875rem",fontWeight:600}}>
                {/* <div style={{width:"16px",height:"16px"}}><Icon.ExternalLink /></div>View original PDF on pCloud */}
              </a>}
              {lines.length>0&&(
                <div>
                  <p style={{fontWeight:700,color:"#0f172a",margin:"0 0 0.75rem",fontSize:"0.9375rem"}}>Order Lines <span style={{color:"#94a3b8",fontWeight:400}}>({lines.length})</span></p>
                  <div style={{border:"1px solid #e2e8f0",borderRadius:"0.875rem",overflowX:"auto"}}>
                    <table style={{width:"100%",minWidth:"900px",borderCollapse:"collapse",fontSize:"0.8125rem"}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          {["Artikelnummer","Bezeichnung","Menge","Preis","Einheit","Rab %","Rabattpreis","Betrag","Delivery" ].map(h=>(
                            <th key={h} style={{padding:"0.625rem 0.875rem",textAlign:["Menge","Preis","Einheit","Rab %","Preis ohne Rabatt","Betrag"].includes(h)?"right":"left",fontSize:"0.7rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((line,i)=>{
                          const qty = asNumber(line.Quantity) ?? 0;
                          const unitPrice = asNumber(line.GrossPrice ?? line.Price);
                          const netUnitPrice = unitPrice !== null ? unitPrice * (1 - (line.DiscountPercent ?? 0) / 100) : null;
                          const total = netUnitPrice !== null ? netUnitPrice * qty : null;
                          return (
                            <tr key={i} style={{background:i%2===0?"#fff":"#fafafa",borderBottom:i<lines.length-1?"1px solid #f1f5f9":"none"}}>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"left",fontFamily:"monospace",color:"#3b82f6",fontSize:"0.75rem",whiteSpace:"nowrap"}}>{line.Number}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"left",color:"#374151"}}>{line.Description}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"right",fontWeight:600,color:"#0f172a",whiteSpace:"nowrap"}}>{line.Quantity}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"right",color:"#374151",whiteSpace:"nowrap"}}>{unitPrice !== null ? unitPrice.toFixed(2) : "—"}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"right",color:"#374151",whiteSpace:"nowrap"}}>{line.Einheit !== undefined && line.Einheit !== null ? line.Einheit : "—"}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"right",color:"#374151",whiteSpace:"nowrap"}}>{line.DiscountPercent !== undefined && line.DiscountPercent !== null ? `${line.DiscountPercent}%` : "—"}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"right",color:"#374151",whiteSpace:"nowrap"}}>{netUnitPrice !== null ? netUnitPrice.toFixed(2) : "—"}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"right",fontWeight:600,color:"#0f172a",whiteSpace:"nowrap"}}>{total !== null ? total.toFixed(2) : "—"}</td>
                              <td style={{padding:"0.625rem 0.875rem",textAlign:"left",color:"#64748b",fontSize:"0.75rem",whiteSpace:"nowrap"}}>{line.DeliveryDate||"—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {order.summary&&(
                <div style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid #bfdbfe",borderRadius:"0.875rem",padding:"1.25rem"}}>
                  <p style={{fontWeight:700,color:"#1d4ed8",fontSize:"0.8rem",textTransform:"uppercase",letterSpacing:"0.05em",margin:"0 0 0.75rem"}}>Summary</p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.375rem 2rem"}}>
                    {[["Lines",order.summary.line_count],["Net total",`${order.summary.currency} ${order.summary.total_net?.toFixed(2)}`],["Folder",order.summary.folder||"—"],["Processed",order.processed_at?new Date(order.processed_at).toLocaleString("de-CH"):"—"]].map(([k,v])=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem"}}>
                        <span style={{color:"#3b82f6"}}>{k}</span>
                        <span style={{fontWeight:600,color:"#1e3a8a"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>  
              )}
              {alerts.length>0&&(
                <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:"0.875rem",padding:"1rem"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                    {alerts.map((a,i)=>(
                      <div key={i}>
                        <p style={{fontWeight:700,color:"#92400e",fontSize:"0.82rem",margin:"0 0 0.35rem"}}>{`${i + 1}. ${a?.message || "Double-check required."}`}</p>
                        {Array.isArray(a?.lines) && a.lines.length > 0 && (
                          <div style={{display:"flex",flexDirection:"column",gap:"0.25rem"}}>
                            {a.lines.map((ln,j)=>(
                              <p key={`${i}-${j}`} style={{margin:0,fontSize:"0.8rem",color:"#78350f"}}>
                                {a.type==="unit_factor"
                                  ? (() => {
                                      const article = ln.article_number || "?";
                                      const factor = ln.factor ?? null;
                                      const base = ln.base_unit_price ?? null;
                                      const erp = ln.erp_unit_price ?? null;
                                      if (factor === null || base === null || erp === null) {
                                        return `Article ${article}: Einheit/unit-factor pricing detected. Please verify unit price manually.`;
                                      }
                                      return `Article ${article}: factor ${factor}, base ${base} -> ERP ${erp}`;
                                    })()
                                  : a.type==="delivery_date_gt_one_week"
                                    ? (() => {
                                        const article = ln.article_number || "?";
                                        const orderDate = ln.order_date || "not found";
                                        const deliveryDate = ln.delivery_date || "not found";
                                        const days = ln.days_after_order;
                                        const daysText = Number.isFinite(days) ? `${days} days` : "more than one week";
                                        return `Article ${article}: order ${orderDate}, delivery ${deliveryDate} (${daysText})`;
                                      })()
                                    : JSON.stringify(ln)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({username,onLogout}) {
  const [orders,setOrders]=useState([]);
  const [stats,setStats]=useState({});
  const [loading,setLoading]=useState(true);
  const [syncing,setSyncing]=useState(false);
  const [syncResult,setSyncResult]=useState(null);
  const [selectedId,setSelectedId]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [showUploadModal,setShowUploadModal]=useState(false);

  const loadData=useCallback(async()=>{
    setLoading(true);
    try { const [o,s]=await Promise.all([apiFetch("/orders"),apiFetch("/stats")]); setOrders(o); setStats(s); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{loadData();},[loadData]);

  const handleSync=async()=>{
    setSyncing(true);
    try { const r=await apiFetch("/sync",{method:"POST"}); setSyncResult(r); await loadData(); }
    catch(e){alert("Sync failed: "+e.message);}
    finally{setSyncing(false);}
  };

  const filtered=orders.filter(o=>{
    const mf=filter==="all"||o.status===filter;
    const q=search.toLowerCase();
    const ms=!q||[o.order_number,o.supplier,o.file_name].some(v=>v?.toLowerCase().includes(q));
    return mf&&ms;
  });

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
      <nav style={{background:"#fff",borderBottom:"1px solid #e2e8f0",position:"sticky",top:0,zIndex:40}}>
        <div style={{maxWidth:"1400px",margin:"0 auto",padding:"0 1.5rem",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
            <div style={{width:"32px",height:"32px",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"18px",height:"18px",color:"#fff"}}><Icon.Layers /></div>
            </div>
            <span style={{fontWeight:800,color:"#0f172a",fontSize:"1rem"}}>E3k</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
            <span style={{fontSize:"0.8125rem",color:"#64748b"}}>Welcome, <strong>{username}</strong></span>
            <button onClick={()=>setShowUploadModal(true)} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",border:"none",color:"#fff",borderRadius:"0.625rem",padding:"0.5rem 1rem",fontWeight:700,fontSize:"0.8125rem",cursor:"pointer"}}>
              <div style={{width:"14px",height:"14px"}}><Icon.Upload /></div>
              Upload PDF
            </button>
            <button onClick={handleSync} disabled={syncing} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:syncing?"#93c5fd":"linear-gradient(135deg,#3b82f6,#1d4ed8)",color:"#fff",border:"none",borderRadius:"0.625rem",padding:"0.5rem 1rem",fontWeight:700,fontSize:"0.8125rem",cursor:syncing?"not-allowed":"pointer"}}>
              <div style={{width:"14px",height:"14px",animation:syncing?"spin 0.8s linear infinite":"none"}}><Icon.Refresh /></div>
              {syncing?"Syncing…":"Sync pCloud"}
            </button>
            <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:"0.375rem",background:"none",border:"1px solid #e2e8f0",color:"#64748b",borderRadius:"0.625rem",padding:"0.5rem 0.875rem",fontWeight:600,fontSize:"0.8125rem",cursor:"pointer"}}>
              <div style={{width:"14px",height:"14px"}}><Icon.Logout /></div>Sign out
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:"1400px",margin:"0 auto",padding:"1.75rem 1.5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"1rem",marginBottom:"1.75rem"}}>
          <StatCard label="Total Orders"  value={stats.total}     icon={<Icon.Package />}      color="#3b82f6" bg="#eff6ff" />
          <StatCard label="Successful"    value={stats.success}   icon={<Icon.CheckCircle />}  color="#16a34a" bg="#dcfce7" />
          <StatCard label="Failed"        value={stats.failure}   icon={<Icon.XCircle />}      color="#dc2626" bg="#fee2e2" />
          <StatCard label="Suppliers"     value={stats.suppliers} icon={<Icon.Building />}     color="#7c3aed" bg="#ede9fe" />
        </div>

        <div style={{display:"flex",gap:"0.75rem",marginBottom:"1.25rem",flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 240px"}}>
            <div style={{position:"absolute",left:"0.75rem",top:"50%",transform:"translateY(-50%)",width:"16px",height:"16px",color:"#94a3b8",pointerEvents:"none"}}><Icon.Search /></div>
            <input type="text" placeholder="Search order #, supplier, file…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"0.625rem",padding:"0.5625rem 0.875rem 0.5625rem 2.25rem",fontSize:"0.875rem",outline:"none",background:"#fff", color:"#0f172a"}}
              onFocus={e=>e.target.style.borderColor="#3b82f6"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
          </div>
          <div style={{display:"flex",gap:"0.375rem",background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:"0.625rem",padding:"0.25rem"}}>
            {["all","success","failure"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"0.375rem 0.875rem",borderRadius:"0.375rem",border:"none",cursor:"pointer",fontWeight:600,fontSize:"0.8125rem",background:filter===f?(f==="success"?"#dcfce7":f==="failure"?"#fee2e2":"#0f172a"):"transparent",color:filter===f?(f==="success"?"#16a34a":f==="failure"?"#dc2626":"#fff"):"#64748b",transition:"all .15s"}}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
                {f!=="all"&&<span style={{marginLeft:"0.375rem",fontSize:"0.75rem"}}>({orders.filter(o=>o.status===f).length})</span>}
              </button>
            ))}
          </div>
          <button onClick={loadData} style={{display:"flex",alignItems:"center",gap:"0.375rem",background:"#fff",border:"1.5px solid #e2e8f0",color:"#64748b",borderRadius:"0.625rem",padding:"0.5625rem 0.875rem",fontWeight:600,fontSize:"0.8125rem",cursor:"pointer"}}>
            <div style={{width:"14px",height:"14px"}}><Icon.Refresh /></div>Refresh
          </button>
        </div>

        {loading?(
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"300px"}}><Spinner size={40} /></div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"5rem 2rem",color:"#94a3b8"}}>
            <div style={{width:"56px",height:"56px",color:"#cbd5e1",margin:"0 auto 1rem"}}><Icon.Package /></div>
            <p style={{fontWeight:700,color:"#64748b",fontSize:"1rem",margin:"0 0 0.375rem"}}>No orders found</p>
            <p style={{fontSize:"0.875rem",margin:0}}>{search||filter!=="all"?"Try adjusting your search or filter":"Click \"Sync pCloud\" to start processing PDFs"}</p>
          </div>
        ):(
          <>
            <p style={{fontSize:"0.8125rem",color:"#94a3b8",marginBottom:"1rem"}}>Showing {filtered.length} of {orders.length} orders</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1rem"}}>
              {filtered.map(order=><OrderCard key={order.id} order={order} onClick={()=>setSelectedId(order.id)} />)}
            </div>
          </>
        )}
      </div>

      {syncResult&&<SyncPanel result={syncResult} onClose={()=>setSyncResult(null)} />}
      {selectedId&&<OrderModal orderId={selectedId} onClose={()=>setSelectedId(null)} />}
      {showUploadModal&&<UploadPdfModal onClose={()=>setShowUploadModal(false)} onSuccess={loadData} />}
    </div>
  );
}

export default function App() {
  const [publicView, setPublicView] = useState(
    window.location.hash === "#/monthly-invoice" ? "monthly-invoice" : "login"
  );

  useEffect(() => {
    const onHashChange = () => {
      setPublicView(window.location.hash === "#/monthly-invoice" ? "monthly-invoice" : "login");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const {user,login,logout}=useAuth();
  const openPublicView = (view) => {
    window.location.hash = view === "monthly-invoice" ? "/monthly-invoice" : "/login";
    setPublicView(view);
  };

  if(!user){
    if (publicView === "monthly-invoice") {
      return <MonthlyInvoicePage onOpenLogin={() => openPublicView("login")} />;
    }
    return <LoginPage onLogin={login} onOpenMonthlyInvoice={() => openPublicView("monthly-invoice")} />;
  }
  return <Dashboard username={user} onLogout={logout} />;
}

