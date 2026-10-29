"use client";
import { useState, useEffect } from "react";
import { ordersAPI } from "@/lib/api";
import Link from "next/link";

const STATUT_CONFIG = {
  PENDING:    { label: "En attente",   color: "#c8a96e", bg: "#c8a96e15", icon: "◷" },
  PAID:       { label: "Payée",        color: "#4fc3f7", bg: "#4fc3f715", icon: "✓" },
  PROCESSING: { label: "En cours",     color: "#ffb74d", bg: "#ffb74d15", icon: "⟳" },
  SHIPPED:    { label: "Expédiée",     color: "#ce93d8", bg: "#ce93d815", icon: "▶" },
  DELIVERED:  { label: "Livrée",       color: "#4caf50", bg: "#4caf5015", icon: "✓" },
  CANCELLED:  { label: "Annulée",      color: "#ef5350", bg: "#ef535015", icon: "✕" },
};

export default function MesCommandesPage() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("TOUS");

  useEffect(() => {
    async function load() {
      try {
        const data = await ordersAPI.getMyOrders();
        setCommandes(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const commandesFiltrees = filtre === "TOUS"
    ? commandes
    : commandes.filter(c => c.statut === filtre);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "Georgia, serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <nav style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1a1a1a" }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>SHOPFLOW</span>
        </Link>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/catalogue" style={{ color: "#888", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Catalogue</Link>
          <Link href="/panier" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Panier</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}>

        <div style={{ marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #1e1e1e" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "400", marginBottom: "8px" }}>Mes Commandes</h1>
          <p style={{ color: "#666", fontFamily: "sans-serif", fontSize: "14px" }}>{commandes.length} commande{commandes.length > 1 ? "s" : ""} au total</p>
        </div>

        {/* Filtres statut */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {["TOUS", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => {
            const cfg = STATUT_CONFIG[s] || { label: "Tous", color: "#888", bg: "#88888815" };
            const isActive = filtre === s;
            return (
              <button key={s} onClick={() => setFiltre(s)} style={{
                padding: "7px 16px", borderRadius: "2px",
                border: `1px solid ${isActive ? cfg.color : "#2a2a2a"}`,
                background: isActive ? cfg.bg : "transparent",
                color: isActive ? cfg.color : "#555",
                fontSize: "11px", fontFamily: "sans-serif",
                letterSpacing: "0.5px", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.2s"
              }}>
                {s === "TOUS" ? "Tous" : cfg.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ width: "36px", height: "36px", border: "2px solid #2a2a2a", borderTop: "2px solid #c8a96e", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : commandesFiltrees.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", color: "#222", marginBottom: "20px" }}>◻</div>
            <p style={{ fontSize: "20px", marginBottom: "8px" }}>Aucune commande</p>
            <Link href="/catalogue" style={{ background: "#c8a96e", color: "#1a1a1a", padding: "12px 28px", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", display: "inline-block", marginTop: "16px" }}>
              Commencer mes achats
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {commandesFiltrees.map(commande => {
              const cfg = STATUT_CONFIG[commande.statut] || {};
              return (
                <div key={commande.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "24px", transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#3a3a3a"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}>

                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <p style={{ fontSize: "16px", letterSpacing: "1px", marginBottom: "4px" }}>{commande.numeroCommande}</p>
                      <p style={{ color: "#555", fontSize: "12px", fontFamily: "sans-serif" }}>
                        {new Date(commande.dateCommande).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      background: cfg.bg, border: `1px solid ${cfg.color}30`,
                      padding: "6px 14px"
                    }}>
                      <span style={{ color: cfg.color, fontSize: "14px" }}>{cfg.icon}</span>
                      <span style={{ color: cfg.color, fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600" }}>{cfg.label}</span>
                    </div>
                  </div>

                  {/* Articles */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #2a2a2a" }}>
                    {commande.lignes?.map(ligne => (
                      <div key={ligne.id} style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "13px" }}>
                        <span style={{ color: "#888" }}>{ligne.productNom} <span style={{ color: "#555" }}>×{ligne.quantite}</span></span>
                        <span style={{ color: "#f0ede8" }}>{ligne.sousTotal} DT</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                    <span style={{ color: "#555", fontSize: "13px", fontFamily: "sans-serif" }}>Total</span>
                    <span style={{ fontSize: "22px", fontWeight: "300", color: "#c8a96e" }}>{commande.totalTTC} DT</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}