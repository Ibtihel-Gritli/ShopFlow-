"use client";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "",
    motDePasse: "", role: "CUSTOMER", nomBoutique: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await authAPI.login({ email: form.email, motDePasse: form.motDePasse });
      } else {
        result = await authAPI.register(form);
      }
      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem("user", JSON.stringify(result));
        if (result.role === "SELLER") window.location.href = "/vendeur";
        else if (result.role === "ADMIN") window.location.href = "/admin";
        else window.location.href = "/";
      } else {
        setMessage(result.message || "Erreur — réessayez");
      }
    } catch (err) {
      setMessage("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    background: "#1a1a1a", border: "1px solid #2a2a2a",
    borderRadius: "2px", color: "#f0ede8",
    fontSize: "14px", fontFamily: "sans-serif",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f0f",
      display: "flex", flexDirection: "column",
      fontFamily: "Georgia, serif"
    }}>
      {/* Navbar */}
      <nav style={{
        background: "#0f0f0f", borderBottom: "1px solid #1a1a1a",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", background: "#c8a96e",
            borderRadius: "8px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "16px", fontWeight: "bold", color: "#1a1a1a"
          }}>S</div>
          <span style={{ fontSize: "18px", letterSpacing: "2px", color: "#f0ede8", fontWeight: "600" }}>
            SHOPFLOW
          </span>
        </Link>
        <Link href="/" style={{
          color: "#888", textDecoration: "none",
          fontSize: "12px", fontFamily: "sans-serif",
          letterSpacing: "1px", textTransform: "uppercase"
        }}>← Retour à l'accueil</Link>
      </nav>

      {/* Contenu centré */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px",
        background: "radial-gradient(ellipse at center top, #1a1a1a 0%, #0f0f0f 60%)"
      }}>
        <div style={{
          width: "100%", maxWidth: "440px"
        }}>
          {/* Titre */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{
              fontSize: "32px", fontWeight: "400",
              color: "#f0ede8", marginBottom: "8px"
            }}>
              {mode === "login" ? "Bon retour" : "Créer un compte"}
            </h1>
            <p style={{ color: "#666", fontSize: "14px", fontFamily: "sans-serif" }}>
              {mode === "login"
                ? "Connectez-vous pour continuer vos achats"
                : "Rejoignez la communauté ShopFlow"}
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", marginBottom: "32px",
            border: "1px solid #2a2a2a", borderRadius: "2px",
            overflow: "hidden"
          }}>
            {[["login", "Connexion"], ["register", "Inscription"]].map(([val, label]) => (
              <button key={val} onClick={() => { setMode(val); setMessage(""); }}
                style={{
                  flex: 1, padding: "12px",
                  background: mode === val ? "#c8a96e" : "transparent",
                  color: mode === val ? "#1a1a1a" : "#888",
                  border: "none", cursor: "pointer",
                  fontSize: "13px", fontFamily: "sans-serif",
                  fontWeight: mode === val ? "700" : "400",
                  letterSpacing: "1px", textTransform: "uppercase",
                  transition: "all 0.2s"
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "register" && (
              <>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input name="prenom" placeholder="Prénom" value={form.prenom}
                    onChange={handleChange} required style={inputStyle} />
                  <input name="nom" placeholder="Nom" value={form.nom}
                    onChange={handleChange} required style={inputStyle} />
                </div>
                <select name="role" value={form.role} onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="CUSTOMER">Client</option>
                  <option value="SELLER">Vendeur</option>
                </select>
                {form.role === "SELLER" && (
                  <input name="nomBoutique" placeholder="Nom de votre boutique"
                    value={form.nomBoutique} onChange={handleChange} style={inputStyle} />
                )}
              </>
            )}

            <input name="email" type="email" placeholder="Adresse email"
              value={form.email} onChange={handleChange} required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#c8a96e"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"} />

            <input name="motDePasse" type="password" placeholder="Mot de passe"
              value={form.motDePasse} onChange={handleChange} required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#c8a96e"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"} />

            {message && (
              <div style={{
                background: "#c0392b20", border: "1px solid #c0392b50",
                color: "#e57373", padding: "12px 16px",
                borderRadius: "2px", fontSize: "13px", fontFamily: "sans-serif"
              }}>{message}</div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "16px",
              background: loading ? "#888" : "#c8a96e",
              border: "none", borderRadius: "2px",
              color: "#1a1a1a", fontSize: "13px",
              fontWeight: "700", letterSpacing: "2px",
              textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "sans-serif", transition: "background 0.2s",
              marginTop: "8px"
            }}>
              {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p style={{
            textAlign: "center", color: "#444",
            fontSize: "12px", fontFamily: "sans-serif",
            marginTop: "24px", lineHeight: "1.6"
          }}>
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}