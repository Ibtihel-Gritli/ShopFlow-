# ShopFlow

**Plateforme e-commerce full-stack : API REST sécurisée avec Spring Boot et interface moderne avec Next.js.**

ShopFlow met en relation des **vendeurs**, qui publient leurs produits, et des **clients**, qui parcourent le catalogue, remplissent un panier et passent commande. Le projet couvre toute la chaîne d'une boutique en ligne : catalogue, panier persistant, coupons, commandes, avis et sécurité par rôles avec JWT.

> Mini-projet réalisé en binôme à la Faculté des Sciences de Monastir (FSM), année universitaire 2025-2026.
> Enseignante : Dr. Ing. Ghada Feki.

![Java](https://img.shields.io/badge/Java-17%2B-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6%20%2B%20JWT-6DB33F)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![H2](https://img.shields.io/badge/H2-dev-1021FF)
![Swagger](https://img.shields.io/badge/API-Swagger%20%2F%20OpenAPI-85EA2D)

---

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Technologies](#technologies)
3. [Architecture](#architecture)
4. [Modèle de données](#modèle-de-données)
5. [Sécurité](#sécurité)
6. [Documentation de l'API](#documentation-de-lapi)
7. [Difficultés rencontrées](#difficultés-rencontrées)
8. [Perspectives](#perspectives)
9. [Auteurs](#auteurs)

---

## Fonctionnalités

### Profils utilisateurs
| Rôle | Ce qu'il peut faire |
|---|---|
| **CUSTOMER** (client) | Parcourir le catalogue, gérer son panier, passer des commandes, suivre leur statut, laisser des avis |
| **SELLER** (vendeur) | Ajouter, modifier et supprimer ses produits, suivre les commandes reçues |
| **ADMIN** | Administration de la plateforme |

### Catalogue produits
- Produits avec **variantes** (taille, couleur) et stock individuel par variante.
- Recherche plein texte et filtres dynamiques (catégorie, prix, vendeur, promotion).
- Pagination, tri par prix, popularité et nouveautés.
- Affichage des promotions (prix barré et remise).
- Classement des meilleures ventes.

### Panier persistant
- Ajout, modification des quantités et suppression d'articles.
- Vérification du **stock en temps réel**.
- Application d'un **code promo** (remise en pourcentage ou montant fixe).
- Panier sauvegardé en base : il reste disponible après la déconnexion.

### Commandes
- Création d'une commande depuis le panier, avec vérification finale du stock.
- Numéro de commande unique (format `ORD-2025-XXXXX`).
- Suivi du statut : `PENDING` → `PAID` → `SHIPPED` → `DELIVERED`.
- Annulation et remboursement simulé.

### Avis et notes
- Avis (note de 1 à 5 et commentaire) **uniquement sur les produits achetés**.
- Note moyenne calculée automatiquement.

---

## Technologies

| Couche | Technologie | Rôle |
|---|---|---|
| Backend | Java 17+, Spring Boot 3 | API REST, logique métier |
| Persistance | Spring Data JPA / Hibernate | JPQL, Specifications, pagination |
| Sécurité | Spring Security 6, JWT | Authentification et autorisations par rôle |
| Productivité | Lombok | Moins de code répétitif |
| Documentation | Swagger / OpenAPI | Documentation et test de l'API |
| Base de données | H2 (développement), PostgreSQL (production) | Stockage |
| Frontend | Next.js 14 (App Router), Axios, Zustand | Interface, appels API, état global |
| Build | Maven | Gestion du backend |
| Tests de l'API | Postman | Vérification des endpoints |

---

## Architecture

Le projet est séparé en deux parties qui communiquent par une **API REST** en JSON.

```
┌───────────────────────┐        HTTP / JSON         ┌───────────────────────────────┐
│  Next.js (port 3000)  │ ─────────────────────────▶ │  Spring Boot API (port 8080)  │
│  App Router, Axios    │ ◀───────────────────────── │  Spring Security + JWT        │
└───────────────────────┘      Bearer token          └──────────────┬────────────────┘
                                                                    │ JPA
                                                                    ▼
                                                      H2 (dev)  /  PostgreSQL (prod)
```

### Backend : architecture en couches
- **Controller** : expose les endpoints REST, valide les entrées (`@Valid`) et renvoie les bons codes HTTP.
- **Service** : contient la logique métier (stock, coupons, commandes) et les transactions (`@Transactional`).
- **Repository** : accès aux données avec Spring Data JPA (JPQL, Specifications, `Pageable`).
- **Entity** : entités JPA qui représentent les tables.
- **DTO** : objets d'échange avec le client, pour ne jamais exposer directement les entités.

### Frontend
- Organisation en composants réutilisables, avec les dossiers `/app` (pages et navigation) et `/components` (par exemple `RatingStars`).
- Client HTTP **Axios** avec un intercepteur qui ajoute le token JWT à chaque requête protégée.
- État global persistant (authentification et panier) avec Zustand, synchronisé avec le serveur.

---

## Modèle de données

| Entité | Description |
|---|---|
| `User` | Compte utilisateur avec son rôle (`ADMIN`, `SELLER`, `CUSTOMER`) |
| `SellerProfile` | Informations de la boutique (nom, description, logo, note) |
| `Address` | Adresses de livraison d'un utilisateur |
| `Category` | Catégories, avec sous-catégories (auto-référence) |
| `Product` | Produit : prix, prix promo, stock, catégories, images |
| `ProductVariant` | Variante d'un produit (ex. taille M) avec stock et écart de prix |
| `Cart` / `CartItem` | Panier du client et ses lignes |
| `Order` / `OrderItem` | Commande, son statut, ses totaux et ses lignes |
| `Coupon` | Code promo (pourcentage ou fixe), expiration, nombre d'usages |
| `Review` | Avis d'un client sur un produit (note de 1 à 5) |

---

## Sécurité

L'authentification est **stateless**, basée sur des JSON Web Tokens (JWT).

| Élément | Détail |
|---|---|
| Access token | Durée de vie de **15 minutes** |
| Refresh token | Durée de vie de **7 jours**, vérifié en base |
| Signature | HS256 avec une clé secrète de 256 bits |
| Autorisations | `@PreAuthorize` par rôle sur les endpoints |
| Routes publiques | Inscription et connexion uniquement |

**Fonctionnement :**
1. À la connexion, le serveur renvoie un access token et un refresh token.
2. Le client envoie l'access token dans l'en-tête `Authorization: Bearer ...`.
3. Un filtre Spring (`JwtFilter`) valide le token à chaque requête.
4. Si le token a expiré (réponse 401), le frontend utilise le refresh token pour obtenir un nouvel access token, puis relance la requête automatiquement.

---

## Documentation de l'API

Une fois le backend lancé, la documentation interactive Swagger est disponible sur :

**http://localhost:8080/swagger-ui**

Principaux groupes d'endpoints :

| Groupe | Chemin | Exemples |
|---|---|---|
| Authentification | `/api/auth` | inscription, connexion, renouvellement du token |
| Produits | `/api/products` | liste paginée avec filtres, détail, recherche, meilleures ventes |
| Catégories | `/api/categories` | arbre des catégories |
| Panier | `/api/cart` | ajout, modification, retrait, code promo |
| Commandes | `/api/orders` | passer une commande, mes commandes, annulation, mise à jour du statut |
| Avis | `/api/reviews` | publier un avis, consulter les avis d'un produit |
| Coupons | `/api/coupons` | gestion et validation des codes |

---

## Difficultés rencontrées

| Difficulté | Solution |
|---|---|
| Comprendre l'architecture full-stack (première expérience avec Spring Boot et Next.js) | Étude d'exemples concrets et de la documentation officielle, test de chaque endpoint avec Postman |
| Mettre en place JWT et Spring Security (protection des endpoints, rôles) | Mise en place progressive : authentification, filtrage des requêtes, puis gestion des rôles |
| Communication frontend / backend (erreurs CORS, token dans les appels) | Configuration CORS du backend, appels API centralisés et intercepteur Axios pour le token |

---

## Perspectives

- Paiement en ligne (Stripe ou Konnect).
- Recherche avancée avec Elasticsearch.
- Notifications en temps réel avec WebSocket (STOMP).
- Cache Redis pour les produits populaires.
- Tests automatisés (JUnit 5, Mockito, Testcontainers).
- CI/CD avec GitHub Actions, Docker et SonarQube.
- Déploiement sur une infrastructure cloud.

---

## Auteurs

Projet réalisé en binôme :

- **Ibtihel Gritli** : [Portfolio](ibtihel-gritli.github.io/Ibtihel-Gritl) · [GitHub](https://github.com/Ibtihel-Gritli) · [LinkedIn](https://www.linkedin.com/in/ibtihelle-gritli)
- **Zayneb Ben Aicha**

Encadrement : Dr. Ing. Ghada Feki, Faculté des Sciences de Monastir, 2025-2026.
