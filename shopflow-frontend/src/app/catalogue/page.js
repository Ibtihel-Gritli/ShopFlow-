"use client";
import { useState, useEffect } from "react";
import { productsAPI, cartAPI } from "@/lib/api";
import Link from "next/link";

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tri, setTri] = useState("recent");
  const [promo, setPromo] = useState(false);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await productsAPI.getAll();
      setProducts(data?.content || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return loadProducts();
    setLoading(true);
    try {
      const data = await productsAPI.search(search);
      setProducts(data?.content || data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart(e, productId) {
    e.preventDefault();
    try {
      await cartAPI.addItem({ productId, quantite: 1 });
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      window.location.href = "/login";
    }
  }

  function getFiltered() {
    let r = [...products];
    if (promo) r = r.filter(p => p.prixPromo);
    switch (tri) {
      case "prix_asc": return r.sort((a, b) => (a.prixPromo || a.prix) - (b.prixPromo || b.prix));
      case "prix_desc": return r.sort((a, b) => (b.prixPromo || b.prix) - (a.prixPromo || a.prix));
      default: return r.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    }
  }

  const filtered = getFiltered();

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "Georgia, serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Navbar */}
      <nav style={{
        background: "#0f0f0f", borderBottom: "1px solid #1e1e1e",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1a1a1a" }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>SHOPFLOW</span>
        </Link>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/" style={{ color: "#888", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Accueil</Link>
          <span style={{ color: "#c8a96e", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Catalogue</span>
          <Link href="/panier" style={{ color: "#888", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Panier</Link>
          <Link href="/login" style={{ background: "#c8a96e", color: "#1a1a1a", padding: "8px 20px", borderRadius: "2px", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>Compte</Link>
        </div>
      </nav>

      {/* Header catalogue */}
      <div style={{
        padding: "48px 40px 32px",
        borderBottom: "1px solid #1e1e1e",
        background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)"
      }}>
        <h1 style={{ fontSize: "40px", fontWeight: "400", marginBottom: "24px", letterSpacing: "-0.5px" }}>
          Catalogue <span style={{ color: "#c8a96e", fontStyle: "italic" }}>complet</span>
        </h1>

        {/* Barre recherche */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0", maxWidth: "600px", marginBottom: "24px" }}>
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: "12px 16px", background: "#1a1a1a",
              border: "1px solid #2a2a2a", borderRight: "none",
              borderRadius: "2px 0 0 2px", color: "#f0ede8",
              fontSize: "14px", fontFamily: "sans-serif", outline: "none"
            }} />
          <button type="submit" style={{
            padding: "12px 24px", background: "#c8a96e",
            border: "none", borderRadius: "0 2px 2px 0",
            color: "#1a1a1a", fontSize: "12px", fontWeight: "700",
            letterSpacing: "1px", textTransform: "uppercase",
            fontFamily: "sans-serif", cursor: "pointer"
          }}>Rechercher</button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); loadProducts(); }} style={{
              padding: "12px 16px", background: "#1e1e1e",
              border: "1px solid #2a2a2a", borderLeft: "none",
              color: "#888", cursor: "pointer", fontSize: "14px"
            }}>✕</button>
          )}
        </form>

        {/* Filtres */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#555", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Trier :</span>
          {[
            ["recent", "Nouveautés"],
            ["prix_asc", "Prix ↑"],
            ["prix_desc", "Prix ↓"],
          ].map(([val, label]) => (
            <button key={val} onClick={() => setTri(val)} style={{
              padding: "7px 16px", borderRadius: "2px",
              border: `1px solid ${tri === val ? "#c8a96e" : "#2a2a2a"}`,
              background: tri === val ? "#c8a96e15" : "transparent",
              color: tri === val ? "#c8a96e" : "#666",
              fontSize: "12px", fontFamily: "sans-serif",
              letterSpacing: "0.5px", cursor: "pointer",
              transition: "all 0.2s"
            }}>{label}</button>
          ))}
          <button onClick={() => setPromo(!promo)} style={{
            padding: "7px 16px", borderRadius: "2px",
            border: `1px solid ${promo ? "#c0392b" : "#2a2a2a"}`,
            background: promo ? "#c0392b20" : "transparent",
            color: promo ? "#e57373" : "#666",
            fontSize: "12px", fontFamily: "sans-serif",
            letterSpacing: "0.5px", cursor: "pointer",
            transition: "all 0.2s"
          }}>% Promos seulement</button>
          <span style={{ color: "#444", fontSize: "13px", fontFamily: "sans-serif", marginLeft: "auto" }}>
            {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grille */}
      <div style={{ padding: "32px 40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "36px", height: "36px", border: "2px solid #2a2a2a", borderTop: "2px solid #c8a96e", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {filtered.map(product => (
              <CatalogueCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                added={addedId === product.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogueCard({ product, onAddToCart, added }) {
  const [hovered, setHovered] = useState(false);
  const hasPromo = product.prixPromo > 0;
  const pct = hasPromo ? Math.round((1 - product.prixPromo / product.prix) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#1a1a1a", borderRadius: "2px",
        border: `1px solid ${hovered ? "#c8a96e40" : "#2a2a2a"}`,
        overflow: "hidden", transition: "all 0.3s",
        transform: hovered ? "translateY(-3px)" : "none",
      }}>

      <Link href={`/produit/${product.id}`} style={{ textDecoration: "none" }}>
        <div style={{ height: "220px", background: "#111", position: "relative", overflow: "hidden" }}>
          {hasPromo && (
            <div style={{ position: "absolute", top: "10px", left: "10px", background: "#c0392b", color: "#fff", padding: "3px 8px", fontSize: "10px", fontFamily: "sans-serif", fontWeight: "700", zIndex: 2 }}>
              -{pct}%
            </div>
          )}
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.nom}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", transform: hovered ? "scale(1.06)" : "scale(1)" }}
              onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: "32px" }}>◻</div>
          )}
        </div>

        <div style={{ padding: "14px 16px" }}>
          <p style={{ color: "#f0ede8", fontSize: "14px", marginBottom: "4px", lineHeight: "1.3" }}>{product.nom}</p>
          {product.stock < 5 && product.stock > 0 && (
            <p style={{ color: "#c8a040", fontSize: "11px", fontFamily: "sans-serif", marginBottom: "6px" }}>Plus que {product.stock} en stock</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "17px", color: hasPromo ? "#e57373" : "#f0ede8", fontWeight: hasPromo ? "600" : "400" }}>
              {hasPromo ? product.prixPromo : product.prix} DT
            </span>
            {hasPromo && <span style={{ fontSize: "12px", color: "#555", textDecoration: "line-through", fontFamily: "sans-serif" }}>{product.prix} DT</span>}
          </div>
        </div>
      </Link>

      {/* Bouton ajouter */}
      <div style={{ padding: "0 16px 14px" }}>
        <button
          onClick={(e) => onAddToCart(e, product.id)}
          disabled={product.stock === 0}
          style={{
            width: "100%", padding: "10px",
            background: added ? "#27ae6020" : product.stock === 0 ? "#1e1e1e" : "transparent",
            border: `1px solid ${added ? "#27ae60" : product.stock === 0 ? "#2a2a2a" : "#3a3a3a"}`,
            borderRadius: "2px",
            color: added ? "#4caf50" : product.stock === 0 ? "#444" : "#c8a96e",
            fontSize: "11px", fontFamily: "sans-serif",
            fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase", cursor: product.stock === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}>
          {added ? "✓ Ajouté !" : product.stock === 0 ? "Rupture de stock" : "+ Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}