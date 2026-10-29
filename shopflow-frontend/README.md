# ShopFlow — Système de Gestion d'une Boutique en Ligne

**Projet académique — FSM Monastir**  
**Enseignante : Dr. Ing. Ghada Feki — Année universitaire 2025/2026**

---

## Description du projet

ShopFlow est une plateforme e-commerce complète de type B2C (Business to Consumer). Elle permet à des vendeurs de publier leurs produits et à des clients d'effectuer des achats en ligne. Le projet couvre toute la chaîne d'une boutique numérique moderne : catalogue produits, panier, commandes, paiement simulé et gestion des stocks.

### Trois profils utilisateurs :
- **ADMIN** : gestion globale de la plateforme, des utilisateurs et des catégories
- **SELLER (Vendeur)** : gestion de sa boutique, de ses produits et de ses commandes reçues
- **CUSTOMER (Client)** : navigation dans le catalogue, gestion du panier, passage de commandes

---

## Stack technologique

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA + Hibernate 6
- Spring Security 6 + JWT (jjwt 0.12.3)
- Base de données H2 (en mémoire, pour le développement)
- Swagger UI / OpenAPI 3 (SpringDoc 2.3.0)
- Lombok + MapStruct
- Maven

### Frontend
- Next.js 16.2.1
- Tailwind CSS
- JavaScript (ES6+)

---

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :
- Java 17 (JDK)
- Maven 3.8+
- Node.js 18+
- Spring Tools Suite 5 (STS) ou IntelliJ IDEA
- Postman (pour tester l'API)
- Un navigateur web moderne (Chrome, Firefox...)

---

## Installation et Lancement

### Etape 1 : Extraire l'archive

Décompressez le fichier ZIP dans un dossier de votre choix.

---

### Etape 2 : Lancer le Backend (Spring Boot)

#### Dans Spring Tools Suite (STS) :
1. Cliquez sur **File → Import → Existing Maven Projects**
2. Sélectionnez le dossier **`backend/`**
3. Cliquez sur **Finish**
4. Attendez que Maven télécharge les dépendances
5. Clic droit sur **`ShopflowApplication.java`**
6. Cliquez sur **Run As → Spring Boot App**

#### Le backend démarre sur :
```
http://localhost:9095
```

#### Vérification :
- **H2 Console** (base de données) : http://localhost:9095/h2-console
  - JDBC URL : `jdbc:h2:mem:shopflowdb`
  - Username : `sa`
  - Password : *(laisser vide)*
- **Swagger UI** (documentation API) : http://localhost:9095/swagger-ui/index.html

---

### Etape 3 : Lancer le Frontend (Next.js)

Ouvrez un terminal dans le dossier **`frontend/`** et tapez :

```bash
npm install
npm run dev
```

Le frontend démarre sur :
```
http://localhost:3000
```

---

### Resolution du port occupé

Si le port 9095 est déjà utilisé, tapez dans un terminal Windows :

```bash
netstat -ano | findstr :9095
```

Repérez le numéro PID dans la dernière colonne, puis tapez :

```bash
taskkill /PID [numéro_PID] /F
```

Relancez ensuite l'application dans STS.

---

## Structure du projet Backend

```
src/main/java/com/shopflow/
├── entity/          <- Entités JPA (12 classes : User, Product, Order...)
├── repository/      <- Interfaces Spring Data JPA (11 repositories)
├── dto/
│   ├── request/     <- Objets reçus depuis le frontend (8 classes)
│   └── response/    <- Objets envoyés vers le frontend (12 classes)
├── mapper/          <- Conversion Entity <-> DTO (5 classes)
├── exception/       <- Gestion des erreurs (3 classes)
├── service/         <- Logique métier (9 classes)
├── controller/      <- Endpoints REST (7 classes)
├── security/        <- JWT Filter + JwtUtil (2 classes)
└── config/          <- Configuration Spring (3 classes)
```

## Structure du projet Frontend

```
src/
├── lib/
│   └── api.js                <- Appels API avec gestion JWT
└── app/
    ├── page.js               <- Page d'accueil (recherche, filtres, promos)
    ├── login/page.js         <- Connexion / Inscription
    ├── catalogue/page.js     <- Catalogue avec recherche
    ├── produit/[id]/page.js  <- Fiche produit + avis
    ├── panier/page.js        <- Panier d'achat
    ├── commande/page.js      <- Tunnel de commande
    ├── client/commandes/
    │   └── page.js           <- Espace client (mes commandes)
    └── vendeur/page.js       <- Espace vendeur
```

---

## Endpoints API

### Authentification — /api/auth
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/auth/register | Inscription client ou vendeur |
| POST | /api/auth/login | Connexion — retourne les tokens JWT |
| POST | /api/auth/refresh | Renouvellement du token |
| POST | /api/auth/logout | Déconnexion |

### Produits — /api/products
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/products | Liste paginée avec filtres |
| GET | /api/products/{id} | Détail d'un produit |
| POST | /api/products | Créer un produit (SELLER) |
| PUT | /api/products/{id} | Modifier un produit |
| DELETE | /api/products/{id} | Désactiver (soft delete) |
| GET | /api/products/search?q= | Recherche plein texte |
| GET | /api/products/top-selling | Top 10 meilleures ventes |

### Catégories — /api/categories
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/categories | Arbre de catégories |
| POST | /api/categories | Créer (ADMIN) |
| PUT | /api/categories/{id} | Modifier (ADMIN) |
| DELETE | /api/categories/{id} | Supprimer (ADMIN) |

### Panier — /api/cart
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/cart | Panier du client connecté |
| POST | /api/cart/items | Ajouter un article |
| PUT | /api/cart/items/{id} | Modifier la quantité |
| DELETE | /api/cart/items/{id} | Retirer un article |
| POST | /api/cart/coupon | Appliquer un code promo |
| DELETE | /api/cart/coupon | Retirer le code promo |

### Commandes — /api/orders
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/orders | Passer une commande |
| GET | /api/orders/my | Mes commandes |
| GET | /api/orders/{id} | Détail d'une commande |
| PUT | /api/orders/{id}/status | Changer le statut |
| PUT | /api/orders/{id}/cancel | Annuler une commande |
| GET | /api/orders | Toutes les commandes (ADMIN) |

### Avis — /api/reviews
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/reviews | Poster un avis (achat vérifié) |
| GET | /api/reviews/product/{id} | Avis d'un produit |
| PUT | /api/reviews/{id}/approve | Approuver (ADMIN) |

### Dashboard — /api/dashboard
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | /api/dashboard/admin | Statistiques globales (ADMIN) |
| GET | /api/dashboard/seller | Statistiques vendeur (SELLER) |
| GET | /api/dashboard/customer | Mes commandes en cours (CUSTOMER) |

### Coupons — /api/coupons
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/coupons | Créer un coupon (ADMIN) |
| PUT | /api/coupons/{id} | Modifier un coupon |
| DELETE | /api/coupons/{id} | Supprimer un coupon |
| GET | /api/coupons/validate/{code} | Vérifier un coupon |

---

## Sécurité JWT

Le projet utilise deux tokens JWT :

| Token | Durée | Utilisation |
|-------|-------|-------------|
| Access Token | 24 heures | Envoyer dans chaque requête protégée |
| Refresh Token | 7 jours | Obtenir un nouveau access token |

Pour les requêtes protégées, ajouter dans le header HTTP :
```
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

---

## Tests avec Postman

Importez le fichier **`shopflow.postman_collection.json`** dans Postman.

Ordre de test recommandé :
1. Register (vendeur) → créer un compte vendeur
2. Login → le token se sauvegarde automatiquement
3. Créer catégorie → avec le token vendeur
4. Créer produit → avec le token vendeur
5. Register (client) → créer un compte client
6. Login → se connecter en tant que client
7. Ajouter au panier → ajouter le produit créé
8. Passer commande → finaliser l'achat

---

## Contenu de l'archive ZIP

```
shopflow/
├── backend/                          <- Code source Spring Boot (sans target/)
├── frontend/                         <- Code source Next.js (sans node_modules/)
├── rapport.pdf                       <- Rapport technique
├── README.md                         <- Ce fichier
└── shopflow.postman_collection.json  <- Collection Postman
```

---

## Difficultés rencontrées et solutions apportées

Ce projet a été réalisé pour la première fois avec Spring Boot 3 et Next.js. C'est aussi la première fois que je travaille avec la sécurité JWT, les relations JPA complexes, et une architecture en couches complète. Plusieurs difficultés ont été rencontrées, et voici une explication simple de chaque problème et de sa solution.

### 1. La configuration du projet Spring Boot

La première difficulté a été de bien configurer le fichier `application.properties`. Ce fichier contient toutes les informations importantes : le numéro de port (9095), la connexion à la base de données H2, et les paramètres du token JWT comme la clé secrète et la durée de validité. Au début, des caractères spéciaux dans ce fichier causaient des erreurs de démarrage. La solution a été de garder le fichier propre et simple, sans caractères spéciaux ni commentaires mal placés.

### 2. La sécurité JWT avec Spring Security 6

La sécurité a été la partie la plus difficile du projet. Spring Security 6 fonctionne différemment des versions précédentes, et la bibliothèque JWT (jjwt 0.12.3) avait changé ses méthodes. Par exemple, la méthode `parserBuilder()` est devenue `parser()`, et `parseClaimsJws()` est devenue `parseSignedClaims()`. Ces petits changements causaient des erreurs de compilation difficiles à trouver. Il a fallu adapter toute la classe `JwtUtil` selon la nouvelle syntaxe. Le filtre JWT (`JwtFilter`) qui vérifie le token à chaque requête a aussi demandé beaucoup d'attention pour ne pas bloquer les routes publiques comme la page d'accueil ou le catalogue des produits.

### 3. La documentation Swagger

Swagger UI permet de tester l'API directement dans le navigateur sans passer par Postman. Cependant, avec Spring Security activé, Swagger était bloqué car l'application pensait que c'était une requête non autorisée. La solution a été d'ajouter des exceptions dans la configuration de sécurité (`SecurityConfig`) pour autoriser l'accès aux URLs de Swagger (`/swagger-ui/**` et `/v3/api-docs/**`) sans demander de token JWT.

### 4. Les DTOs et les Mappers

L'énoncé demande de ne jamais exposer directement les entités JPA dans les réponses de l'API. Il faut utiliser des objets intermédiaires appelés DTOs (Data Transfer Objects). Le principe est le suivant : les entités parlent à la base de données, et les DTOs parlent au frontend. La difficulté était de créer des classes séparées pour les requêtes (`Request`) et les réponses (`Response`), et d'écrire les Mappers pour convertir d'un format à l'autre. Par exemple, le `ProductMapper` convertit un objet `Product` (entité JPA avec toutes ses données internes) en `ProductResponse` (DTO simple avec seulement les champs utiles pour l'affichage).

### 5. La gestion des exceptions

Pour éviter que l'application plante en affichant une erreur Java incompréhensible pour l'utilisateur, il faut intercepter les erreurs et renvoyer des messages clairs en JSON. La classe `GlobalExceptionHandler` avec l'annotation `@RestControllerAdvice` joue ce rôle : elle attrape toutes les exceptions lancées dans l'application et les transforme en réponses HTTP avec le bon code d'erreur (400 pour une erreur métier comme "email déjà utilisé", 404 pour une ressource non trouvée comme "produit introuvable", et 500 pour une erreur interne du serveur).

### 6. Les relations entre les tables JPA (problème LAZY)

JPA utilise par défaut le chargement "LAZY" pour les relations entre entités. Cela signifie que les données liées, comme les variantes d'un produit ou le vendeur associé à un produit, ne sont pas chargées automatiquement depuis la base de données. Quand on essayait d'accéder à ces données en dehors d'une transaction ouverte, l'application renvoyait une erreur 500. La solution a été d'ajouter l'annotation `@Transactional(readOnly = true)` sur les méthodes de service qui lisent des données, et d'ajouter `spring.jpa.open-in-view=true` dans `application.properties` pour garder la session JPA ouverte pendant toute la durée de la requête HTTP.

### 7. Le CORS entre Spring Boot et Next.js

Le CORS (Cross-Origin Resource Sharing) est une règle de sécurité des navigateurs qui bloque par défaut les appels entre deux applications qui tournent sur des ports différents. Le frontend (port 3000) ne pouvait pas appeler le backend (port 9095) car le navigateur bloquait ces requêtes avec une erreur "CORS policy". La solution a été de configurer explicitement dans `SecurityConfig` que les requêtes venant de `http://localhost:3000` sont autorisées, en précisant les méthodes HTTP acceptées (GET, POST, PUT, DELETE) et les headers autorisés.

### 8. Pourquoi H2 comme base de données ?

H2 est une base de données qui fonctionne entièrement en mémoire (dans la RAM de l'ordinateur), sans aucune installation séparée. C'est le choix idéal pour le développement car elle démarre automatiquement avec l'application Spring Boot et les tables sont créées automatiquement par Hibernate. L'inconvénient principal est que toutes les données sont perdues à chaque redémarrage. Pour contourner ce problème, la propriété `ddl-auto` a été changée de `create-drop` (qui supprime les tables à l'arrêt) à `create` (qui garde les tables entre les redémarrages). Un autre problème inattendu est apparu : après plusieurs heures de fonctionnement sans redémarrage, H2 perdait sa connexion et renvoyait l'erreur "Table USERS not found". La solution était simplement de redémarrer l'application. Pour un projet en production réelle, il faudrait remplacer H2 par PostgreSQL ou MySQL.

### 9. Pourquoi Next.js comme framework frontend ?

Next.js a été choisi car il propose un système de routing automatique très pratique : chaque fichier `page.js` dans un dossier devient automatiquement une page web accessible par une URL. Il est aussi très bien documenté pour les débutants. La difficulté principale rencontrée était liée à la version 16 de Next.js : les paramètres dynamiques des URLs (comme l'ID d'un produit dans `/produit/[id]`) sont devenus des Promises asynchrones. Accéder directement à `params.id` ne fonctionnait plus et provoquait des avertissements. La solution a été d'utiliser le hook React `use(params)` pour "déballer" la Promise avant d'accéder à l'ID.

### 10. L'installation de Lombok dans Spring Tools Suite

Lombok est une bibliothèque Java qui génère automatiquement le code répétitif comme les getters, setters et constructeurs. Sans Lombok, chaque entité aurait besoin de dizaines de lignes de code supplémentaires. Le problème était que Lombok ne fonctionnait pas automatiquement dans Spring Tools Suite 5. Il a fallu télécharger le fichier JAR de Lombok séparément et l'ajouter manuellement au fichier de configuration `.ini` de STS avec la ligne `-javaagent:chemin/vers/lombok.jar`, puis redémarrer l'IDE.

---

*Projet développé dans le cadre du cours de Java EE — GLSI 2 — FSM Monastir 2025/2026*
