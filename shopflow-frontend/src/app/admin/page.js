"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis localStorage
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    // Charger les stats du dashboard admin
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:9095/api/dashboard/admin",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Erreur dashboard admin :", err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#f0ede8",
      fontFamily: "Georgia, serif"
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: "#0f0f0f",
        borderBottom: "1px solid #1e1e1e",
        padding: "0 40px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <Link href="/" style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <div style={{
            width: "32px", height: "32px",
            background: "#c8a96e", borderRadius: "8px",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: "bold", color: "#1a1a1a"
          }}>S</div>
          <span style={{
            fontSize: "18px", letterSpacing: "2px",
            color: "#f0ede8", fontWeight: "600"
          }}>SHOPFLOW</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{
            color: "#c8a96e", fontSize: "12px",
            fontFamily: "sans-serif", letterSpacing: "2px",
            textTransform: "uppercase"
          }}>Administration</span>
          <button onClick={handleLogout} style={{
            background: "none",
            border: "1px solid #2a2a2a",
            color: "#888", padding: "8px 16px",
            cursor: "pointer", fontSize: "11px",
            fontFamily: "sans-serif", letterSpacing: "1px",
            textTransform: "uppercase"
          }}>Quitter</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px" }}>

        {/* ── En-tête ── */}
        <div style={{
          marginBottom: "40px",
          paddingBottom: "24px",
          borderBottom: "1px solid #1e1e1e"
        }}>
          <p style={{
            color: "#c8a96e", fontSize: "12px",
            fontFamily: "sans-serif", letterSpacing: "2px",
            textTransform: "uppercase", marginBottom: "8px"
          }}>Tableau de bord</p>
          <h1 style={{ fontSize: "36px", fontWeight: "400" }}>
            Bonjour, {user?.prenom || "Administrateur"}
          </h1>
          <p style={{
            color: "#555", fontFamily: "sans-serif",
            fontSize: "14px", marginTop: "6px"
          }}>
            Vue globale de la plateforme ShopFlow
          </p>
        </div>

        {/* ── Cartes stats ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{
              width: "36px", height: "36px",
              border: "2px solid #2a2a2a",
              borderTop: "2px solid #c8a96e",
              borderRadius: "50%", margin: "0 auto",
              animation: "spin 1s linear infinite"
            }} />
          </div>
        ) : (
          <>
            {/* Statistiques globales */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              marginBottom: "48px"
            }}>
              {[
                {
                  label: "Utilisateurs",
                  value: stats?.totalUsers || 0,
                  color: "#c8a96e",
                  icon: "◉"
                },
                {
                  label: "Produits",
                  value: stats?.totalProducts || 0,
                  color: "#4fc3f7",
                  icon: "◈"
                },
                {
                  label: "Commandes",
                  value: stats?.totalOrders || 0,
                  color: "#ce93d8",
                  icon: "◎"
                },
                {
                  label: "Chiffre d'affaires",
                  value: `${stats?.chiffreAffaires || 0} DT`,
                  color: "#4caf50",
                  icon: "◆"
                },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  padding: "24px",
                  transition: "border-color 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = stat.color + "50"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px"
                  }}>
                    <span style={{
                      color: "#444", fontSize: "11px",
                      fontFamily: "sans-serif",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase"
                    }}>{stat.label}</span>
                    <span style={{ color: stat.color, fontSize: "20px" }}>
                      {stat.icon}
                    </span>
                  </div>
                  <p style={{
                    fontSize: "32px", fontWeight: "300",
                    color: stat.color
                  }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* ── Top produits ── */}
            {stats?.topProduits && stats.topProduits.length > 0 && (
              <div style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                padding: "28px",
                marginBottom: "24px"
              }}>
                <h3 style={{
                  fontSize: "12px", fontFamily: "sans-serif",
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: "#c8a96e", marginBottom: "20px"
                }}>Top produits les plus vendus</h3>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  {stats.topProduits.map((nom, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "12px 0",
                      borderBottom: i < stats.topProduits.length - 1
                        ? "1px solid #2a2a2a" : "none"
                    }}>
                      <span style={{
                        color: "#c8a96e",
                        fontSize: "18px",
                        fontWeight: "300",
                        width: "24px"
                      }}>#{i + 1}</span>
                      <span style={{
                        fontSize: "14px", color: "#f0ede8"
                      }}>{nom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Actions rapides ── */}
            <div style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              padding: "28px"
            }}>
              <h3 style={{
                fontSize: "12px", fontFamily: "sans-serif",
                letterSpacing: "2px", textTransform: "uppercase",
                color: "#888", marginBottom: "20px"
              }}>Actions rapides</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px"
              }}>
                {[
                  {
                    label: "Gérer les catégories",
                    desc: "Ajouter, modifier, supprimer",
                    href: "#"
                  },
                  {
                    label: "Voir toutes les commandes",
                    desc: "Suivre et mettre à jour les statuts",
                    href: "#"
                  },
                  {
                    label: "Gérer les coupons",
                    desc: "Créer des codes promo",
                    href: "#"
                  },
                ].map((action, i) => (
                  <div key={i} style={{
                    border: "1px solid #2a2a2a",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#c8a96e50";
                      e.currentTarget.style.background = "#c8a96e08";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <p style={{
                      fontSize: "14px",
                      color: "#f0ede8",
                      marginBottom: "6px"
                    }}>{action.label}</p>
                    <p style={{
                      color: "#555",
                      fontSize: "12px",
                      fontFamily: "sans-serif"
                    }}>{action.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Lien vers Swagger ── */}
        <div style={{
          marginTop: "24px",
          padding: "20px",
          border: "1px solid #1e1e1e",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: "14px", marginBottom: "4px" }}>
              Documentation API
            </p>
            <p style={{
              color: "#555",
              fontSize: "12px",
              fontFamily: "sans-serif"
            }}>
              Testez tous les endpoints depuis Swagger UI
            </p>
          </div>
          
            href="http://localhost:9095/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: "1px solid #c8a96e",
              color: "#c8a96e",
              textDecoration: "none",
              fontSize: "12px",
              fontFamily: "sans-serif",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}
          </a>
        </div>
      </div>
    </div>
  );
}