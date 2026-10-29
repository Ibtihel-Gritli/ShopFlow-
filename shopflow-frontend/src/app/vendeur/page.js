"use client";
import { useState, useEffect } from "react";
import { productsAPI } from "@/lib/api";
import Link from "next/link";

export default function VendeurPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("liste");
  const [form, setForm] = useState({ nom: "", description: "", prix: "", stock: "", prixPromo: "", categorieIds: [], images: [] });

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const data = await productsAPI.getAll();
      if (data?.content) setProducts(data.content);
      else if (Array.isArray(data)) setProducts(data);
      else setProducts([]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await productsAPI.create({
        ...form,
        prix: parseFloat(form.prix),
        stock: parseInt(form.stock),
        prixPromo: form.prixPromo ? parseFloat(form.prixPromo) : null,
      });
      setMessage("✓ Produit créé avec succès !");
      setForm({ nom: "", description: "", prix: "", stock: "", prixPromo: "", categorieIds: [], images: [] });
      await loadProducts();
      setActiveTab("liste");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("✕ Erreur — vérifiez que vous êtes connecté");
    }
  }

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    background: "#111", border: "1px solid #2a2a2a",
    borderRadius: "2px", color: "#f0ede8",
    fontSize: "14px", fontFamily: "sans-serif",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s"
  };

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "Georgia, serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <nav style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1a1a1a" }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>SHOPFLOW</span>
        </Link>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ color: "#c8a96e", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Espace Vendeur</span>
          <Link href="/" style={{ color: "#555", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Accueil</Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ color: "#c8a96e", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Tableau de bord</p>
            <h1 style={{ fontSize: "36px", fontWeight: "400" }}>Bonjour, {user.prenom || "Vendeur"}</h1>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "16px 24px", textAlign: "center" }}>
              <p style={{ color: "#c8a96e", fontSize: "24px", fontWeight: "300" }}>{products.length}</p>
              <p style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Produits</p>
            </div>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "16px 24px", textAlign: "center" }}>
              <p style={{ color: "#4caf50", fontSize: "24px", fontWeight: "300" }}>{products.filter(p => p.actif).length}</p>
              <p style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Actifs</p>
            </div>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "16px 24px", textAlign: "center" }}>
              <p style={{ color: "#ef5350", fontSize: "24px", fontWeight: "300" }}>{products.filter(p => p.stock < 5).length}</p>
              <p style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Stock faible</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", marginBottom: "32px" }}>
          {[["liste", "Mes produits"], ["ajouter", "Ajouter un produit"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "12px 24px", background: "none",
              border: "none", borderBottom: `2px solid ${activeTab === tab ? "#c8a96e" : "transparent"}`,
              color: activeTab === tab ? "#c8a96e" : "#555",
              fontSize: "13px", fontFamily: "sans-serif",
              letterSpacing: "1px", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
              marginBottom: "-1px"
            }}>{label}</button>
          ))}
        </div>

        {/* Tab : Liste */}
        {activeTab === "liste" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ width: "36px", height: "36px", border: "2px solid #2a2a2a", borderTop: "2px solid #c8a96e", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ color: "#444", marginBottom: "20px", fontFamily: "sans-serif" }}>Vous n'avez pas encore de produits</p>
                <button onClick={() => setActiveTab("ajouter")} style={{ background: "#c8a96e", border: "none", color: "#1a1a1a", padding: "12px 28px", cursor: "pointer", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Ajouter votre premier produit
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#1e1e1e" }}>
                {/* Header tableau */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", gap: "16px", padding: "12px 20px", background: "#111", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", color: "#444" }}>
                  <span>Produit</span><span>Prix</span><span>Stock</span><span>Statut</span><span></span>
                </div>
                {products.map(product => (
                  <div key={product.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", gap: "16px", padding: "16px 20px", background: "#0f0f0f", alignItems: "center", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0f0f0f"}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", background: "#1e1e1e", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", flexShrink: 0 }}>
                        {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} /> : "◻"}
                      </div>
                      <div>
                        <p style={{ fontSize: "14px" }}>{product.nom}</p>
                        <p style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif" }}>{product.description?.substring(0, 40)}...</p>
                      </div>
                    </div>
                    <div>
                      {product.prixPromo ? (
                        <div>
                          <p style={{ color: "#e57373", fontSize: "14px" }}>{product.prixPromo} DT</p>
                          <p style={{ color: "#444", fontSize: "12px", textDecoration: "line-through", fontFamily: "sans-serif" }}>{product.prix} DT</p>
                        </div>
                      ) : <p style={{ fontSize: "14px" }}>{product.prix} DT</p>}
                    </div>
                    <p style={{ fontSize: "14px", color: product.stock < 5 ? (product.stock === 0 ? "#ef5350" : "#ffb74d") : "#4caf50", fontFamily: "sans-serif" }}>
                      {product.stock} unités
                    </p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: product.actif ? "#4caf5015" : "#ef535015", border: `1px solid ${product.actif ? "#4caf5030" : "#ef535030"}` }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: product.actif ? "#4caf50" : "#ef5350" }} />
                      <span style={{ color: product.actif ? "#4caf50" : "#ef5350", fontSize: "11px", fontFamily: "sans-serif" }}>
                        {product.actif ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <Link href={`/produit/${product.id}`} style={{ color: "#c8a96e", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>
                      Voir →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab : Ajouter */}
        {activeTab === "ajouter" && (
          <div style={{ maxWidth: "600px" }}>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input name="nom" placeholder="Nom du produit *" value={form.nom}
                onChange={handleChange} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#c8a96e"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              <textarea name="description" placeholder="Description" value={form.description}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = "#c8a96e"}
                onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Prix *</label>
                  <input name="prix" type="number" placeholder="0.00" value={form.prix}
                    onChange={handleChange} required step="0.01" min="0" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#c8a96e"}
                    onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                </div>
                <div>
                  <label style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Prix promo</label>
                  <input name="prixPromo" type="number" placeholder="0.00" value={form.prixPromo}
                    onChange={handleChange} step="0.01" min="0" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#c8a96e"}
                    onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                </div>
              </div>
              <div>
                <label style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Stock *</label>
                <input name="stock" type="number" placeholder="0" value={form.stock}
                  onChange={handleChange} required min="0" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#c8a96e"}
                  onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              </div>
              <div>
                <label style={{ color: "#555", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>URL Image</label>
                <input type="text" placeholder="https://exemple.com/image.jpg"
                  onChange={e => setForm({ ...form, images: e.target.value ? [e.target.value] : [] })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#c8a96e"}
                  onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              </div>

              {message && (
                <div style={{
                  padding: "14px 16px",
                  background: message.startsWith("✓") ? "#4caf5015" : "#ef535015",
                  border: `1px solid ${message.startsWith("✓") ? "#4caf5050" : "#ef535050"}`,
                  color: message.startsWith("✓") ? "#4caf50" : "#ef5350",
                  fontSize: "13px", fontFamily: "sans-serif"
                }}>{message}</div>
              )}

              <button type="submit" style={{
                padding: "16px", background: "#c8a96e",
                border: "none", color: "#1a1a1a",
                fontSize: "12px", fontFamily: "sans-serif",
                fontWeight: "700", letterSpacing: "2px",
                textTransform: "uppercase", cursor: "pointer",
                marginTop: "8px"
              }}>Créer le produit</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}