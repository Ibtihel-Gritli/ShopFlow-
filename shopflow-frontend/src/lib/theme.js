// Thème partagé pour toutes les pages ShopFlow
export const ACCENT = "#c8a96e";

export function getTheme(darkMode) {
  return {
    bg: darkMode ? "#0f0f0f" : "#ffffff",
    bgSec: darkMode ? "#1a1a1a" : "#f8f8f6",
    bgCard: darkMode ? "#1e1e1e" : "#ffffff",
    bgInput: darkMode ? "#1a1a1a" : "#f8f8f6",
    text: darkMode ? "#f0ede8" : "#1a1a1a",
    textSec: darkMode ? "#9a9690" : "#666260",
    border: darkMode ? "#2a2a2a" : "#eeecea",
    accent: "#c8a96e",
    accentDark: "#a8893e",
    navBg: "#0f0f0f",
    red: "#c0392b",
    green: "#27ae60",
  };
}

// Navbar commune à toutes les pages
export function NavBar({ darkMode, setDarkMode, user, onLogout }) {
  return null; // On l'inline dans chaque page pour avoir Link de Next.js
}