"use client";
import { useState, useEffect } from "react";
import { cartAPI } from "@/lib/api";
import Link from "next/link";

export default function PanierPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }
    try {
      setCart(await cartAPI.getCart());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId) {
    try {
      setCart(await cartAPI.removeItem(itemId));
    } catch (err) { console.error(err); }
  }

  async function handleCoupon(e) {
    e.preventDefault();
    try {
      setCart(await cartAPI.applyCoupon(coupon));
      setCouponMsg("✓ Code appliqué !");
      setCoupon("");
    } catch { setCouponMsg("✕ Code invalide"); }
    setTimeout(() => setCouponMsg(""), 3000);
  }

  const isConnected = typeof window !== "undefined" && localStorage.getItem("accessToken");
  const hasItems = cart?.lignes?.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "Georgia, serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Navbar */}
      <nav style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1a1a1a" }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>SHOPFLOW</span>
        </Link>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/catalogue" style={{ color: "#888", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Catalogue</Link>
          <Link href="/login" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Mon compte</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Titre */}
        <div style={{ marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #1e1e1e" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "400" }}>Mon Panier</h1>
          {hasItems && (
            <p style={{ color: "#888", fontFamily: "sans-serif", fontSize: "14px", marginTop: "6px" }}>
              {cart.lignes.length} article{cart.lignes.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "36px", height: "36px", border: "2px solid #2a2a2a", borderTop: "2px solid #c8a96e", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : !isConnected ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "20px", marginBottom: "8px" }}>Vous n'êtes pas connecté</p>
            <p style={{ color: "#666", fontFamily: "sans-serif", marginBottom: "28px" }}>Connectez-vous pour accéder à votre panier</p>
            <Link href="/login" style={{ background: "#c8a96e", color: "#1a1a1a", padding: "14px 32px", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>Se connecter</Link>
          </div>
        ) : !hasItems ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "64px", color: "#222", marginBottom: "20px" }}>◻</div>
            <p style={{ fontSize: "22px", marginBottom: "8px" }}>Votre panier est vide</p>
            <p style={{ color: "#666", fontFamily: "sans-serif", marginBottom: "28px" }}>Découvrez notre catalogue et ajoutez des articles</p>
            <Link href="/catalogue" style={{ background: "#c8a96e", color: "#1a1a1a", padding: "14px 32px", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>Voir le catalogue</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "48px", alignItems: "start" }}>

            {/* Articles */}
            <div>
              {cart.lignes.map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", gap: "20px", alignItems: "center",
                  padding: "20px 0",
                  borderBottom: i < cart.lignes.length - 1 ? "1px solid #1e1e1e" : "none"
                }}>
                  {/* Image miniature */}
                  <div style={{ width: "80px", height: "80px", background: "#1a1a1a", border: "1px solid #2a2a2a", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#333" }}>
                    ◻
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "16px", marginBottom: "4px" }}>{item.productNom}</p>
                    {item.variantAttribut && (
                      <p style={{ color: "#666", fontSize: "12px", fontFamily: "sans-serif" }}>{item.variantAttribut} : {item.variantValeur}</p>
                    )}
                    <p style={{ color: "#c8a96e", fontSize: "14px", fontFamily: "sans-serif", marginTop: "6px" }}>
                      {item.productPrix} DT × {item.quantite}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "20px", fontWeight: "300", marginBottom: "8px" }}>{item.sousTotal} DT</p>
                    <button onClick={() => handleRemove(item.id)} style={{
                      background: "none", border: "none",
                      color: "#444", cursor: "pointer",
                      fontSize: "12px", fontFamily: "sans-serif",
                      letterSpacing: "1px", textTransform: "uppercase",
                      transition: "color 0.2s"
                    }}
                      onMouseEnter={e => e.target.style.color = "#c0392b"}
                      onMouseLeave={e => e.target.style.color = "#444"}
                    >Retirer</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "28px", position: "sticky", top: "80px" }}>
              <h3 style={{ fontSize: "14px", fontFamily: "sans-serif", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "24px" }}>Résumé</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {[["Sous-total", `${cart.sousTotal} DT`], ["Livraison", cart.fraisLivraison > 0 ? `${cart.fraisLivraison} DT` : "Gratuit"]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "14px" }}>
                    <span style={{ color: "#666" }}>{l}</span>
                    <span style={{ color: "#f0ede8" }}>{v}</span>
                  </div>
                ))}
                {cart.remiseCoupon > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "14px" }}>
                    <span style={{ color: "#4caf50" }}>Remise coupon</span>
                    <span style={{ color: "#4caf50" }}>-{cart.remiseCoupon} DT</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "16px" }}>Total</span>
                <span style={{ fontSize: "24px", fontWeight: "300", color: "#c8a96e" }}>{cart.totalTTC} DT</span>
              </div>

              {/* Code promo */}
              <form onSubmit={handleCoupon} style={{ display: "flex", gap: "0", marginBottom: "16px" }}>
                <input type="text" placeholder="Code promo"
                  value={coupon} onChange={e => setCoupon(e.target.value)}
                  style={{
                    flex: 1, padding: "10px 12px",
                    background: "#111", border: "1px solid #2a2a2a",
                    borderRight: "none", color: "#f0ede8",
                    fontSize: "13px", fontFamily: "sans-serif", outline: "none"
                  }} />
                <button type="submit" style={{
                  padding: "10px 16px", background: "#2a2a2a",
                  border: "1px solid #2a2a2a", color: "#888",
                  fontSize: "12px", fontFamily: "sans-serif",
                  letterSpacing: "0.5px", cursor: "pointer"
                }}>OK</button>
              </form>
              {couponMsg && <p style={{ color: couponMsg.startsWith("✓") ? "#4caf50" : "#e57373", fontSize: "12px", fontFamily: "sans-serif", marginBottom: "12px" }}>{couponMsg}</p>}

              <Link href="/commande" style={{
                display: "block", padding: "16px",
                background: "#c8a96e", textAlign: "center",
                color: "#1a1a1a", textDecoration: "none",
                fontSize: "12px", fontFamily: "sans-serif",
                fontWeight: "700", letterSpacing: "2px",
                textTransform: "uppercase", transition: "background 0.2s"
              }}>Commander →</Link>

              <Link href="/catalogue" style={{
                display: "block", padding: "12px",
                textAlign: "center", color: "#555",
                textDecoration: "none", fontSize: "12px",
                fontFamily: "sans-serif", letterSpacing: "1px",
                marginTop: "10px"
              }}>Continuer mes achats</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}