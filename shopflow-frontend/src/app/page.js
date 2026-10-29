"use client";
import { useState, useEffect } from "react";
import { productsAPI } from "@/lib/api";
import Link from "next/link";

export default function HomePage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tri, setTri] = useState("recent");
  const [promoSeulement, setPromoSeulement] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProducts();
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  async function loadProducts() {
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
    try {
      const data = await productsAPI.search(search);
      setProducts(data?.content || data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function getProductsFiltres() {
    let result = [...products];
    if (promoSeulement) result = result.filter(p => p.prixPromo);
    switch (tri) {
      case "prix_asc": return result.sort((a, b) => (a.prixPromo || a.prix) - (b.prixPromo || b.prix));
      case "prix_desc": return result.sort((a, b) => (b.prixPromo || b.prix) - (a.prixPromo || a.prix));
      case "promo": return result.sort((a, b) => (b.prixPromo ? 1 : 0) - (a.prixPromo ? 1 : 0));
      default: return result.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
    }
  }

  function handleLogout() {
    localStorage.clear();
    setUser(null);
    window.location.reload();
  }

  const theme = {
    bg: darkMode ? "#0f0f0f" : "#ffffff",
    bgSec: darkMode ? "#1a1a1a" : "#f8f8f6",
    bgCard: darkMode ? "#1e1e1e" : "#ffffff",
    text: darkMode ? "#f0ede8" : "#1a1a1a",
    textSec: darkMode ? "#9a9690" : "#666260",
    border: darkMode ? "#2a2a2a" : "#eeecea",
    accent: "#c8a96e",
    accentDark: "#a8893e",
    red: darkMode ? "#e85d5d" : "#c0392b",
    navBg: darkMode ? "#0f0f0f" : "#1a1a1a",
  };

  const filteredProducts = getProductsFiltres();

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", fontFamily: "'Georgia', serif", transition: "all 0.3s ease" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: theme.navBg,
        color: "#f0ede8",
        padding: "0 40px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid #2a2a2a",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px",
              background: theme.accent,
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: "bold", color: "#1a1a1a"
            }}>S</div>
            <span style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "2px", color: "#f0ede8" }}>
              SHOPFLOW
            </span>
          </div>
        </Link>

        {/* Liens nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {["Catalogue", "Promos", "Nouveautés"].map((item, i) => (
            <Link key={i} href={i === 0 ? "/catalogue" : "/"} style={{
              color: "#aaa",
              textDecoration: "none",
              fontSize: "13px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
              onMouseEnter={e => e.target.style.color = theme.accent}
              onMouseLeave={e => e.target.style.color = "#aaa"}
            >{item}</Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

          {/* Dark mode */}
          <button onClick={() => setDarkMode(!darkMode)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#aaa", fontSize: "18px", padding: "4px"
          }}>{darkMode ? "☀" : "◑"}</button>

          {/* Panier */}
          <Link href="/panier" style={{ textDecoration: "none" }}>
            <div style={{
              position: "relative", color: "#f0ede8",
              fontSize: "20px", cursor: "pointer"
            }}>
              ⊕
              <span style={{
                position: "absolute", top: "-6px", right: "-8px",
                background: theme.accent, color: "#1a1a1a",
                borderRadius: "50%", width: "16px", height: "16px",
                fontSize: "10px", display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: "sans-serif", fontWeight: "bold"
              }}>0</span>
            </div>
          </Link>

          {/* User */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link href={user.role === "SELLER" ? "/vendeur" : user.role === "ADMIN" ? "/admin" : "/client/commandes"}
                style={{
                  background: theme.accent, color: "#1a1a1a",
                  padding: "6px 14px", borderRadius: "4px",
                  textDecoration: "none", fontSize: "12px",
                  fontFamily: "sans-serif", fontWeight: "600",
                  letterSpacing: "0.5px", textTransform: "uppercase"
                }}>
                {user.prenom}
              </Link>
              <button onClick={handleLogout} style={{
                background: "none", border: "1px solid #444",
                color: "#aaa", padding: "6px 12px",
                borderRadius: "4px", cursor: "pointer",
                fontSize: "11px", fontFamily: "sans-serif",
                letterSpacing: "0.5px", textTransform: "uppercase"
              }}>Quitter</button>
            </div>
          ) : (
            <Link href="/login" style={{
              background: theme.accent, color: "#1a1a1a",
              padding: "8px 20px", borderRadius: "4px",
              textDecoration: "none", fontSize: "12px",
              fontFamily: "sans-serif", fontWeight: "700",
              letterSpacing: "1px", textTransform: "uppercase"
            }}>Connexion</Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        background: darkMode
          ? "linear-gradient(135deg, #1a1a1a 0%, #111 50%, #0f0f0f 100%)"
          : "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        padding: "80px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Déco en arrière-plan */}
        <div style={{
          position: "absolute", top: "20px", left: "10%",
          width: "300px", height: "300px",
          background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)`,
          borderRadius: "50%", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: "-50px", right: "10%",
          width: "400px", height: "400px",
          background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
          borderRadius: "50%", pointerEvents: "none"
        }} />

        {/* Bannière promo */}
        <div style={{
          display: "inline-block",
          background: `${theme.accent}20`,
          border: `1px solid ${theme.accent}50`,
          color: theme.accent,
          padding: "6px 20px", borderRadius: "40px",
          fontSize: "12px", letterSpacing: "2px",
          fontFamily: "sans-serif", textTransform: "uppercase",
          marginBottom: "24px"
        }}>
          Livraison gratuite dès 100 DT
        </div>

        <h1 style={{
          fontSize: "56px", fontWeight: "400",
          color: "#f0ede8", lineHeight: "1.1",
          marginBottom: "16px", letterSpacing: "-1px"
        }}>
          Découvrez notre<br />
          <span style={{ color: theme.accent, fontStyle: "italic" }}>collection exclusive</span>
        </h1>

        <p style={{
          color: "#888", fontSize: "16px",
          fontFamily: "sans-serif", marginBottom: "36px",
          maxWidth: "500px", margin: "0 auto 36px"
        }}>
          Les meilleurs produits au meilleur prix, livrés directement chez vous
        </p>

        {/* Barre de recherche hero */}
        <form onSubmit={handleSearch} style={{
          maxWidth: "560px", margin: "0 auto",
          display: "flex", gap: "0",
          background: "#f8f8f6",
          borderRadius: "4px", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}>
          <input
            type="text"
            placeholder="Rechercher un produit, une marque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, padding: "16px 20px",
              border: "none", outline: "none",
              fontSize: "14px", background: "transparent",
              color: "#1a1a1a", fontFamily: "sans-serif"
            }}
          />
          <button type="submit" style={{
            background: theme.accent, border: "none",
            padding: "16px 28px", cursor: "pointer",
            color: "#1a1a1a", fontSize: "13px",
            fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase", fontFamily: "sans-serif"
          }}>
            Chercher
          </button>
        </form>
      </div>

      {/* ── STATS RAPIDES ── */}
      <div style={{
        background: darkMode ? "#161616" : "#1a1a1a",
        padding: "20px 40px",
        display: "flex", justifyContent: "center", gap: "60px"
      }}>
        {[
          ["10 000+", "Clients satisfaits"],
          ["500+", "Produits disponibles"],
          ["24h", "Livraison express"],
          ["100%", "Paiement sécurisé"]
        ].map(([val, label], i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ color: theme.accent, fontSize: "22px", fontWeight: "600" }}>{val}</div>
            <div style={{ color: "#666", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 40px" }}>

        {/* Filtres et tri */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "36px",
          paddingBottom: "20px", borderBottom: `1px solid ${theme.border}`
        }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "400", margin: "0 0 4px" }}>
              {promoSeulement ? "Promotions en cours" : "Tous nos produits"}
            </h2>
            <p style={{ color: theme.textSec, fontSize: "14px", fontFamily: "sans-serif", margin: 0 }}>
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Bouton promo */}
            <button
              onClick={() => setPromoSeulement(!promoSeulement)}
              style={{
                padding: "8px 16px", borderRadius: "4px",
                border: promoSeulement ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                background: promoSeulement ? `${theme.accent}20` : "transparent",
                color: promoSeulement ? theme.accent : theme.textSec,
                cursor: "pointer", fontSize: "12px",
                fontFamily: "sans-serif", letterSpacing: "0.5px",
                textTransform: "uppercase", fontWeight: "600"
              }}>
              % Promos
            </button>

            {/* Select tri */}
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value)}
              style={{
                padding: "8px 14px", borderRadius: "4px",
                border: `1px solid ${theme.border}`,
                background: theme.bgCard, color: theme.text,
                fontSize: "13px", fontFamily: "sans-serif",
                cursor: "pointer", outline: "none"
              }}>
              <option value="recent">Nouveautés</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="promo">Promotions d'abord</option>
            </select>
          </div>
        </div>

        {/* Grille produits */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "40px", height: "40px", border: `3px solid ${theme.border}`,
              borderTop: `3px solid ${theme.accent}`,
              borderRadius: "50%", margin: "0 auto 16px",
              animation: "spin 1s linear infinite"
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: theme.textSec, fontFamily: "sans-serif" }}>Chargement...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 0",
            color: theme.textSec, fontFamily: "sans-serif"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>◻</div>
            <p style={{ fontSize: "18px" }}>Aucun produit disponible</p>
            <p style={{ fontSize: "14px" }}>Essayez d'autres filtres ou revenez plus tard</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} theme={theme} />
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0f0f0f", color: "#555",
        padding: "40px", textAlign: "center",
        borderTop: "1px solid #1a1a1a",
        fontFamily: "sans-serif", fontSize: "13px"
      }}>
        <p style={{ color: "#888", marginBottom: "8px", letterSpacing: "2px", textTransform: "uppercase", fontSize: "16px", fontFamily: "Georgia, serif" }}>SHOPFLOW</p>
        <p>© 2025 ShopFlow — Projet académique FSM Monastir</p>
        <p style={{ marginTop: "8px", color: "#333" }}>Dr. Ing. Ghada Feki — GLSI 2 — 2025/2026</p>
      </footer>
    </div>
  );
}

// ── Composant carte produit ──
function ProductCard({ product, theme }) {
  const [hovered, setHovered] = useState(false);
  const hasPromo = product.prixPromo && product.prixPromo > 0;
  const discountPercent = hasPromo
    ? Math.round((1 - product.prixPromo / product.prix) * 100)
    : 0;

  return (
    <Link href={`/produit/${product.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: theme.bgCard,
          borderRadius: "2px",
          border: `1px solid ${hovered ? theme.accent + "50" : theme.border}`,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered
            ? `0 20px 40px ${theme.accent}15`
            : "0 2px 8px rgba(0,0,0,0.05)",
        }}>

        {/* Image */}
        <div style={{
          height: "260px", overflow: "hidden",
          background: theme.bgSec, position: "relative"
        }}>
          {hasPromo && (
            <div style={{
              position: "absolute", top: "12px", left: "12px",
              background: "#c0392b", color: "#fff",
              padding: "4px 10px", borderRadius: "2px",
              fontSize: "11px", fontFamily: "sans-serif",
              fontWeight: "700", letterSpacing: "0.5px",
              zIndex: 2
            }}>-{discountPercent}%</div>
          )}
          {product.stock === 0 && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 2
            }}>
              <span style={{
                color: "#fff", fontSize: "12px", fontFamily: "sans-serif",
                letterSpacing: "2px", textTransform: "uppercase",
                background: "rgba(0,0,0,0.7)", padding: "8px 16px",
                borderRadius: "2px"
              }}>Rupture de stock</span>
            </div>
          )}
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.nom}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.5s ease",
                transform: hovered ? "scale(1.05)" : "scale(1)"
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.parentElement.querySelector(".placeholder").style.display = "flex";
              }}
            />
          ) : null}
          <div className="placeholder" style={{
            display: product.images && product.images[0] ? "none" : "flex",
            alignItems: "center", justifyContent: "center",
            height: "100%", color: theme.textSec,
            flexDirection: "column", gap: "8px"
          }}>
            <span style={{ fontSize: "40px", opacity: 0.3 }}>◻</span>
            <span style={{ fontSize: "12px", fontFamily: "sans-serif", opacity: 0.4 }}>Pas d'image</span>
          </div>
        </div>

        {/* Infos */}
        <div style={{ padding: "16px 20px" }}>

          {/* Alerte stock */}
          {product.stock > 0 && product.stock < 5 && (
            <p style={{
              color: "#c8a040", fontSize: "11px",
              fontFamily: "sans-serif", marginBottom: "6px",
              letterSpacing: "0.5px", textTransform: "uppercase"
            }}>
              Plus que {product.stock} en stock
            </p>
          )}

          <h3 style={{
            fontSize: "15px", fontWeight: "400",
            color: theme.text, marginBottom: "4px",
            letterSpacing: "0.3px", lineHeight: "1.3"
          }}>{product.nom}</h3>

          {product.sellerNom && (
            <p style={{
              color: theme.textSec, fontSize: "12px",
              fontFamily: "sans-serif", marginBottom: "12px"
            }}>par {product.sellerNom}</p>
          )}

          {/* Prix */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {hasPromo ? (
              <>
                <span style={{
                  fontSize: "20px", fontWeight: "600",
                  color: "#c0392b"
                }}>{product.prixPromo} DT</span>
                <span style={{
                  fontSize: "14px", color: theme.textSec,
                  textDecoration: "line-through",
                  fontFamily: "sans-serif"
                }}>{product.prix} DT</span>
              </>
            ) : (
              <span style={{
                fontSize: "20px", fontWeight: "400",
                color: theme.text
              }}>{product.prix} DT</span>
            )}
          </div>

          {/* Bouton */}
          <div style={{
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: `1px solid ${theme.border}`,
            display: "flex", justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{
              fontSize: "12px", fontFamily: "sans-serif",
              color: theme.textSec, letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}>Voir le produit</span>
            <span style={{
              color: hovered ? theme.accent : theme.textSec,
              fontSize: "18px", transition: "color 0.3s",
              transform: hovered ? "translateX(4px)" : "translateX(0)",
              display: "inline-block", transition: "all 0.3s"
            }}>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
