"use client";
import { useState, useEffect, use } from "react";
import { productsAPI, cartAPI, reviewsAPI } from "@/lib/api";
import Link from "next/link";

export default function ProduitPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [variantChoisi, setVariantChoisi] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [message, setMessage] = useState("");
  const [avisForm, setAvisForm] = useState({ note: 5, commentaire: "" });
  const [avisMessage, setAvisMessage] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await productsAPI.getById(id);
        setProduct(p);
        const r = await reviewsAPI.getByProduct(id);
        setReviews(Array.isArray(r) ? r : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAddToCart() {
    try {
      await cartAPI.addItem({ productId: product.id, variantId: variantChoisi, quantite });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      setMessage("❌ Connectez-vous d'abord !");
    }
  }

  async function handleAvis(e) {
    e.preventDefault();
    try {
      await reviewsAPI.create({ productId: parseInt(id), note: avisForm.note, commentaire: avisForm.commentaire });
      setAvisMessage("✓ Avis envoyé — en attente de modération");
      setAvisForm({ note: 5, commentaire: "" });
      const r = await reviewsAPI.getByProduct(id);
      setReviews(Array.isArray(r) ? r : []);
    } catch {
      setAvisMessage("✕ Vous devez avoir acheté ce produit");
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: "40px", height: "40px", border: "2px solid #2a2a2a", borderTop: "2px solid #c8a96e", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <p style={{ color: "#f0ede8", fontSize: "24px", fontFamily: "Georgia, serif" }}>Produit introuvable</p>
      <Link href="/catalogue" style={{ color: "#c8a96e", fontFamily: "sans-serif", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase" }}>← Retour au catalogue</Link>
    </div>
  );

  const hasPromo = product.prixPromo > 0;
  const pct = hasPromo ? Math.round((1 - product.prixPromo / product.prix) * 100) : 0;
  const avgNote = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.note, 0) / reviews.length).toFixed(1) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", color: "#f0ede8", fontFamily: "Georgia, serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Navbar */}
      <nav style={{ background: "#0f0f0f", borderBottom: "1px solid #1e1e1e", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#c8a96e", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1a1a1a" }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>SHOPFLOW</span>
        </Link>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/catalogue" style={{ color: "#888", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>← Catalogue</Link>
          <Link href="/panier" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Panier</Link>
        </div>
      </nav>

      {/* Fil d'Ariane */}
      <div style={{ padding: "16px 40px", borderBottom: "1px solid #1a1a1a" }}>
        <p style={{ color: "#444", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>
          <Link href="/" style={{ color: "#444", textDecoration: "none" }}>Accueil</Link>
          {" / "}
          <Link href="/catalogue" style={{ color: "#444", textDecoration: "none" }}>Catalogue</Link>
          {" / "}
          <span style={{ color: "#888" }}>{product.nom}</span>
        </p>
      </div>

      {/* Contenu produit */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }}>

          {/* Image */}
          <div style={{ position: "sticky", top: "80px" }}>
            <div style={{
              background: "#1a1a1a", borderRadius: "2px",
              height: "500px", display: "flex", alignItems: "center",
              justifyContent: "center", overflow: "hidden",
              border: "1px solid #2a2a2a", position: "relative"
            }}>
              {hasPromo && (
                <div style={{ position: "absolute", top: "16px", left: "16px", background: "#c0392b", color: "#fff", padding: "6px 14px", fontSize: "13px", fontFamily: "sans-serif", fontWeight: "700", zIndex: 2 }}>
                  -{pct}%
                </div>
              )}
              {product.stock === 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
                  <span style={{ color: "#fff", fontSize: "14px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", border: "1px solid #fff", padding: "10px 20px" }}>Rupture de stock</span>
                </div>
              )}
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.nom}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.style.display = "none"; }} />
              ) : (
                <div style={{ color: "#333", fontSize: "64px", textAlign: "center" }}>
                  <div>◻</div>
                  <div style={{ fontSize: "12px", fontFamily: "sans-serif", color: "#444", marginTop: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>Pas d'image</div>
                </div>
              )}
            </div>
          </div>

          {/* Infos */}
          <div>
            {product.sellerNom && (
              <p style={{ color: "#c8a96e", fontSize: "12px", fontFamily: "sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
                par {product.sellerNom}
              </p>
            )}
            <h1 style={{ fontSize: "36px", fontWeight: "400", lineHeight: "1.2", marginBottom: "16px", letterSpacing: "-0.5px" }}>
              {product.nom}
            </h1>

            {/* Note */}
            {avgNote && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: i <= Math.round(avgNote) ? "#c8a96e" : "#333", fontSize: "14px" }}>★</span>
                  ))}
                </div>
                <span style={{ color: "#888", fontSize: "13px", fontFamily: "sans-serif" }}>{avgNote}/5 ({reviews.length} avis)</span>
              </div>
            )}

            <p style={{ color: "#888", fontSize: "15px", lineHeight: "1.7", marginBottom: "28px", fontFamily: "sans-serif" }}>
              {product.description}
            </p>

            {/* Prix */}
            <div style={{ marginBottom: "28px", paddingBottom: "28px", borderBottom: "1px solid #2a2a2a" }}>
              {hasPromo ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                  <span style={{ fontSize: "40px", fontWeight: "300", color: "#e57373" }}>{product.prixPromo} DT</span>
                  <span style={{ fontSize: "20px", color: "#444", textDecoration: "line-through", fontFamily: "sans-serif" }}>{product.prix} DT</span>
                  <span style={{ background: "#c0392b20", color: "#e57373", padding: "4px 10px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "700" }}>-{pct}%</span>
                </div>
              ) : (
                <span style={{ fontSize: "40px", fontWeight: "300" }}>{product.prix} DT</span>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: "24px" }}>
              {product.stock === 0 ? (
                <p style={{ color: "#c0392b", fontSize: "13px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>✕ Rupture de stock</p>
              ) : product.stock < 5 ? (
                <p style={{ color: "#c8a040", fontSize: "13px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>⚠ Plus que {product.stock} article{product.stock > 1 ? "s" : ""} disponible{product.stock > 1 ? "s" : ""}</p>
              ) : (
                <p style={{ color: "#4caf50", fontSize: "13px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>✓ En stock ({product.stock} disponibles)</p>
              )}
            </div>

            {/* Variantes */}
            {product.variantes?.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ color: "#888", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "10px" }}>
                  Options disponibles
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.variantes.map(v => (
                    <button key={v.id} onClick={() => setVariantChoisi(v.id)} style={{
                      padding: "8px 16px", borderRadius: "2px",
                      border: `1px solid ${variantChoisi === v.id ? "#c8a96e" : "#2a2a2a"}`,
                      background: variantChoisi === v.id ? "#c8a96e15" : "transparent",
                      color: variantChoisi === v.id ? "#c8a96e" : "#888",
                      fontSize: "13px", fontFamily: "sans-serif",
                      cursor: "pointer", transition: "all 0.2s"
                    }}>
                      {v.attribut} : {v.valeur}
                      {v.prixDelta > 0 && <span style={{ color: "#666" }}> (+{v.prixDelta} DT)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "#888", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "10px" }}>Quantité</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0", width: "120px" }}>
                <button onClick={() => setQuantite(Math.max(1, quantite - 1))} style={{
                  width: "36px", height: "36px", background: "#1a1a1a",
                  border: "1px solid #2a2a2a", color: "#888",
                  fontSize: "18px", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>−</button>
                <div style={{
                  flex: 1, height: "36px", background: "#111",
                  border: "1px solid #2a2a2a", borderLeft: "none", borderRight: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#f0ede8", fontSize: "16px", fontFamily: "sans-serif"
                }}>{quantite}</div>
                <button onClick={() => setQuantite(Math.min(product.stock, quantite + 1))} style={{
                  width: "36px", height: "36px", background: "#1a1a1a",
                  border: "1px solid #2a2a2a", color: "#888",
                  fontSize: "18px", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>+</button>
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button onClick={handleAddToCart} disabled={product.stock === 0} style={{
                padding: "16px 32px",
                background: added ? "#27ae60" : product.stock === 0 ? "#1e1e1e" : "#c8a96e",
                border: "none", borderRadius: "2px",
                color: added ? "#fff" : product.stock === 0 ? "#444" : "#1a1a1a",
                fontSize: "13px", fontFamily: "sans-serif",
                fontWeight: "700", letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                transition: "all 0.3s"
              }}>
                {added ? "✓ Ajouté au panier !" : product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
              </button>
              <Link href="/panier" style={{
                padding: "14px 32px", background: "transparent",
                border: "1px solid #2a2a2a", borderRadius: "2px",
                color: "#888", textDecoration: "none",
                fontSize: "13px", fontFamily: "sans-serif",
                letterSpacing: "2px", textTransform: "uppercase",
                textAlign: "center", transition: "all 0.2s"
              }}>Voir le panier</Link>
            </div>

            {message && <p style={{ color: "#e57373", fontSize: "13px", fontFamily: "sans-serif", marginTop: "12px" }}>{message}</p>}
          </div>
        </div>

        {/* Section avis */}
        <div style={{ marginTop: "80px", paddingTop: "48px", borderTop: "1px solid #1e1e1e" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "400", marginBottom: "32px" }}>
            Avis clients
            {reviews.length > 0 && <span style={{ color: "#888", fontSize: "16px", fontFamily: "sans-serif", marginLeft: "12px" }}>({reviews.length})</span>}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
            {/* Laisser un avis */}
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "28px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "400", marginBottom: "20px", color: "#c8a96e", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "sans-serif", fontSize: "12px" }}>
                Laisser un avis
              </h3>
              <form onSubmit={handleAvis} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <p style={{ color: "#666", fontSize: "11px", fontFamily: "sans-serif", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Note</p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setAvisForm({...avisForm, note: n})} style={{
                        width: "36px", height: "36px", border: "1px solid",
                        borderColor: avisForm.note >= n ? "#c8a96e" : "#2a2a2a",
                        background: avisForm.note >= n ? "#c8a96e15" : "transparent",
                        color: avisForm.note >= n ? "#c8a96e" : "#444",
                        cursor: "pointer", fontSize: "16px", borderRadius: "2px",
                        transition: "all 0.2s"
                      }}>★</button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Partagez votre expérience..."
                  value={avisForm.commentaire}
                  onChange={e => setAvisForm({...avisForm, commentaire: e.target.value})}
                  style={{
                    padding: "12px 14px", background: "#111",
                    border: "1px solid #2a2a2a", borderRadius: "2px",
                    color: "#f0ede8", fontSize: "13px",
                    fontFamily: "sans-serif", resize: "vertical",
                    minHeight: "80px", outline: "none"
                  }} />
                {avisMessage && (
                  <p style={{ color: avisMessage.startsWith("✓") ? "#4caf50" : "#e57373", fontSize: "13px", fontFamily: "sans-serif" }}>
                    {avisMessage}
                  </p>
                )}
                <button type="submit" style={{
                  padding: "12px", background: "#c8a96e",
                  border: "none", borderRadius: "2px",
                  color: "#1a1a1a", fontSize: "12px",
                  fontWeight: "700", letterSpacing: "1px",
                  textTransform: "uppercase", fontFamily: "sans-serif",
                  cursor: "pointer"
                }}>Publier mon avis</button>
              </form>
            </div>

            {/* Liste avis */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.length === 0 ? (
                <div style={{ color: "#444", textAlign: "center", padding: "40px 0", fontFamily: "sans-serif" }}>
                  <p style={{ fontSize: "32px", marginBottom: "12px" }}>◻</p>
                  <p>Aucun avis pour ce produit</p>
                </div>
              ) : reviews.map(review => (
                <div key={review.id} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "2px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <span style={{ color: "#f0ede8", fontSize: "14px", marginRight: "8px" }}>
                        {review.customerPrenom} {review.customerNom?.charAt(0)}.
                      </span>
                      <span style={{ color: "#444", fontSize: "12px", fontFamily: "sans-serif" }}>
                        {review.dateCreation && new Date(review.dateCreation).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map(i => (
                        <span key={i} style={{ color: i <= review.note ? "#c8a96e" : "#333", fontSize: "13px" }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: "#888", fontSize: "14px", fontFamily: "sans-serif", lineHeight: "1.6" }}>{review.commentaire}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}