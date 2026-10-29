"use client";
import { useState, useEffect } from "react";
import { ordersAPI, cartAPI } from "@/lib/api";
import Link from "next/link";

export default function CommandePage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [commande, setCommande] = useState(null);
  const [step, setStep] = useState(1);
  const [adresse, setAdresse] = useState({ rue: "", ville: "", codePostal: "", pays: "Tunisie" });
  const [adresseId, setAdresseId] = useState(null);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    async function load() {
      try { setCart(await cartAPI.getCart()); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleSaveAdresse(e) {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:9095/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...adresse, principal: true })
      });
      const data = await res.json();
      setAdresseId(data.id);
      setStep(2);
    } catch { setMessage("❌ Erreur lors de la sauvegarde"); }
    finally { setSavingAddr(false); }
  }

  async function handleCommander() {
    try {
      setCommande(await ordersAPI.create({ adresseId }));
    } catch { setMessage("❌ Erreur — réessayez"); }
  }

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    background: "#111", border: "1px solid #2a2a2a",
    borderRadius: "2px", color: "#f0ede8",
    fontSize: "14px", fontFamily: "sans-serif",
    outline: "none", boxSizing: "border-box"
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: "36px", height: "36px", border: "2px solid #2a2a2a", borderTop: "2px solid #c8a96e", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (commande) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: "480px", textAlign: "center", padding: "40px" }}>
        <div style={{ width: "80px", height: "80px", border: "2px solid #c8a96e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: "32px" }}>✓</div>
        <h1 style={{ fontSize: "32px", fontWeight: "400", color: "#c8a96e", marginBottom: "16px" }}>Commande confirmée</h1>
        <p style={{ color: "#888", fontFamily: "sans-serif", fontSize: "14px", marginBottom: "8px" }}>Numéro de commande</p>
        <p style={{ fontSize: "20px", marginBottom: "24px", letterSpacing: "2px" }}>{commande.numeroCommande}</p>
        <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "20px", marginBottom: "28px" }}>
          {[["Total payé", `${commande.totalTTC} DT`], ["Statut", commande.statut]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "14px", marginBottom: "8px" }}>
              <span style={{ color: "#666" }}>{l}</span>
              <span style={{ color: "#f0ede8" }}>{v}</span>
            </div>
          ))}
        </div>
        <Link href="/client/commandes" style={{ display: "block", padding: "14px 32px", background: "#c8a96e", color: "#1a1a1a", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
          Suivre ma commande →
        </Link>
        <Link href="/" style={{ display: "block", padding: "12px", color: "#555", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", marginTop: "12px" }}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "Georgia, serif" }}>
      <nav style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1a1a1a" }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>SHOPFLOW</span>
        </Link>
        <Link href="/panier" style={{ color: "#888", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>← Panier</Link>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "48px" }}>
          {[["1", "Adresse"], ["2", "Confirmation"]].map(([n, label], i) => (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px", height: "32px",
                  border: `1px solid ${step >= parseInt(n) ? "#c8a96e" : "#2a2a2a"}`,
                  background: step >= parseInt(n) ? "#c8a96e15" : "transparent",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  color: step >= parseInt(n) ? "#c8a96e" : "#444",
                  fontSize: "13px", fontFamily: "sans-serif", fontWeight: "600"
                }}>{n}</div>
                <span style={{ color: step >= parseInt(n) ? "#f0ede8" : "#444", fontSize: "13px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>{label}</span>
              </div>
              {i < 1 && <div style={{ width: "60px", height: "1px", background: step > 1 ? "#c8a96e50" : "#2a2a2a", margin: "0 16px" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "40px" }}>

          {/* Étape 1 : Adresse */}
          {step === 1 && (
            <form onSubmit={handleSaveAdresse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "400", marginBottom: "8px" }}>Adresse de livraison</h2>
              <input placeholder="Rue et numéro" value={adresse.rue}
                onChange={e => setAdresse({...adresse, rue: e.target.value})}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#c8a96e"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input placeholder="Ville" value={adresse.ville}
                  onChange={e => setAdresse({...adresse, ville: e.target.value})}
                  required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#c8a96e"}
                  onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                <input placeholder="Code postal" value={adresse.codePostal}
                  onChange={e => setAdresse({...adresse, codePostal: e.target.value})}
                  required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#c8a96e"}
                  onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              </div>
              <input placeholder="Pays" value={adresse.pays}
                onChange={e => setAdresse({...adresse, pays: e.target.value})}
                required style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#c8a96e"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              <button type="submit" disabled={savingAddr} style={{
                padding: "16px", background: "#c8a96e", border: "none",
                color: "#1a1a1a", fontSize: "12px", fontFamily: "sans-serif",
                fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase",
                cursor: "pointer", marginTop: "8px"
              }}>{savingAddr ? "..." : "Confirmer l'adresse →"}</button>
            </form>
          )}

          {/* Étape 2 : Confirmation */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "400", marginBottom: "24px" }}>Confirmer la commande</h2>
              <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "20px", marginBottom: "20px" }}>
                <p style={{ color: "#c8a96e", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>Adresse de livraison</p>
                <p style={{ fontSize: "15px" }}>{adresse.rue}</p>
                <p style={{ color: "#888", fontFamily: "sans-serif", fontSize: "14px" }}>{adresse.codePostal} {adresse.ville} — {adresse.pays}</p>
                <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", marginTop: "10px" }}>Modifier</button>
              </div>
              {message && <p style={{ color: "#e57373", fontFamily: "sans-serif", fontSize: "13px", marginBottom: "16px" }}>{message}</p>}
              <button onClick={handleCommander} style={{
                width: "100%", padding: "16px", background: "#c8a96e",
                border: "none", color: "#1a1a1a", fontSize: "12px",
                fontFamily: "sans-serif", fontWeight: "700",
                letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer"
              }}>Passer la commande ✓</button>
            </div>
          )}

          {/* Récapitulatif */}
          <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "24px", alignSelf: "start", position: "sticky", top: "20px" }}>
            <h3 style={{ fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "2px", textTransform: "uppercase", color: "#666", marginBottom: "20px" }}>Récapitulatif</h3>
            {cart?.lignes?.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontFamily: "sans-serif", fontSize: "13px" }}>
                <span style={{ color: "#888" }}>{item.productNom} ×{item.quantite}</span>
                <span style={{ color: "#f0ede8" }}>{item.sousTotal} DT</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "14px", marginTop: "14px" }}>
              {[["Sous-total", `${cart?.sousTotal} DT`], ["Livraison", cart?.fraisLivraison > 0 ? `${cart?.fraisLivraison} DT` : "Gratuit"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "13px", marginBottom: "8px" }}>
                  <span style={{ color: "#666" }}>{l}</span>
                  <span style={{ color: "#f0ede8" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a2a2a", paddingTop: "12px", marginTop: "4px" }}>
                <span style={{ fontSize: "15px" }}>Total</span>
                <span style={{ fontSize: "22px", fontWeight: "300", color: "#c8a96e" }}>{cart?.totalTTC} DT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}