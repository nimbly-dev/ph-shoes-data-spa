<p align="center">
  <span style="display: inline-block; padding: 0 20px;">
    <a href="https://github.com/nimbly-dev/ph-shoes-extraction-automation">
      <img src="./images/extraction_image_box.png" alt="Extraction Automation" width="200" />
    </a>
  </span>
  <span style="display: inline-block; padding: 0 20px;">
    <a href="https://github.com/nimbly-dev/ph-shoes-dbt-analytics">
      <img src="./images/dbt_analytics_image_box.png" alt="DBT Analytics" width="200" />
    </a>
  </span>
  <span style="display: inline-block; padding: 0 20px;">
    <a href="https://github.com/nimbly-dev/ph-shoes-data-spa">
      <img src="./images/spa_image_box.png" alt="SPA Project" width="200" />
    </a>
  </span>
</p>

<p align="center">
  <strong>You are viewing: <code>ph-shoes-data-spa</code> repository</strong>
</p>
[![Live on Render](https://img.shields.io/badge/Live_Render-✔️-brightgreen)](https://ph-shoes-frontend.onrender.com/)

---


# PH Shoes Data SPA Project Overview

The **PH Shoes Data SPA Project** serves as the user-facing layer of the entire platform. It delivers a modern, responsive web experience built on top of a production-grade backend powered by Spring Boot and a rich frontend using React.

This project is divided into two main components:

---

##  Backend — Java Spring Boot (v21)

The backend is responsible for exposing APIs that serve product data directly from the Snowflake-transformed model `fact_product_shoes`. It includes:

* **JPA Specification-based Filtering**
  Allows users to search and filter products by brand, gender, age group, price, and more — all dynamically composed at runtime using JPA Criteria Specifications.

* **AI-Powered Search Endpoint**
  Accepts natural language queries (e.g., “cheap running shoes for men”) and processes them via:

  1. **Prompt-based parsing** using OpenAI’s GPT API (to turn the query into structured filters).
  2. **Vector similarity lookup** against Ada-generated embeddings stored in Snowflake.

This hybrid approach supports both structured filtering and semantic search in a unified API layer.

---

##  Frontend — React + MUI

The frontend is a **single-page application** (SPA) built with React, styled using Material UI (MUI), and fully optimized for mobile responsiveness. It includes:

* A **manual filter UI** (brand, gender, keyword filtering, on sale)
* An **AI search bar** with natural language support
* Pagination, loading states, and a clean card-style product display


---

#  API Endpoints — PH Shoes Data SPA

The backend exposes a pair of RESTful endpoints to serve product data for the frontend. These support both **manual filtering** via query parameters and **AI-powered search** using natural language queries.


##  `GET /api/v1/fact-product-shoes`

This endpoint allows clients to filter product listings using structured query parameters. It's designed to support pagination and multiple optional filters.

###  Supported Query Parameters

| Parameter   | Type         | Description                                           |
| ----------- | ------------ | ----------------------------------------------------- |
| `brand`     | `string`     | Filter by shoe brand (e.g. `nike`, `hoka`)            |
| `gender`    | `string`     | Filter by gender (`male`, `female`, `unisex`)         |
| `ageGroup`  | `string`     | Filter by age group (`adult`, `kids`, etc.)           |
| `date`      | `YYYY-MM-DD` | Fetch entries from a specific collection date         |
| `startDate` | `YYYY-MM-DD` | Start of a date range (must be paired with `endDate`) |
| `endDate`   | `YYYY-MM-DD` | End of a date range                                   |
| `keyword`   | `string`     | Search in product title or subtitle                   |
| `onSale`    | `boolean`    | Set to `true` to only return discounted products      |
| `page`      | `number`     | Page number (pagination)                              |
| `size`      | `number`     | Number of items per page (default: 20)                |

###  Example:

```
GET /api/v1/fact-product-shoes?brand=nike&onSale=true&page=0&size=15
```

---

##  `GET /api/v1/fact-product-shoes/search?q=...`

This endpoint performs a **semantic search** based on a natural language query. It combines prompt engineering and vector similarity against pre-generated OpenAI embeddings.

###  Input Validation:

The query string is:

* Escaped to prevent HTML/script injection
* Whitelisted to alphanumeric characters, basic punctuation, and space
* Rejected if it contains unsafe patterns (`<`, `>`, `%`, `;`)

#### 🔍 Query Parameters

| Parameter | Type     | Description                                                   |
| --------- | -------- | ------------------------------------------------------------- |
| `q`       | `string` | Natural language query (e.g. `"cheap running shoes for men"`) |
| `page`    | `number` | Page number (default: 0)                                      |
| `size`    | `number` | Items per page (default: 15)                                  |

####  Example:

```
GET /api/v1/fact-product-shoes/search?q=affordable+trail+shoes+for+women
```

---

# PH Shoes Catalog — Frontend UI

The **frontend** is a Single Page Application (SPA) built using **React** and styled with **Material UI (MUI)**. It is optimized for both desktop and mobile, allowing users to browse, search, and filter shoe products with ease.

---

## Manual Filters

Users can filter products by brand, gender, date range, keyword, and sale status. Filter state is fully reactive and synced to backend query parameters.

<p align="center">
  <img src="./images/manual_filters.JPG" alt="Manual Filter UI - Light Theme" width="85%" />
</p>

<p align="center">
  <img src="./images/manual_filters_darktheme.JPG" alt="Manual Filter UI - Dark Theme" width="85%" />
</p>

---

## On-Sale Products

Toggle the “On Sale Only” checkbox to show discounted products.

<p align="center">
  <img src="./images/manual_filters_onsale.JPG" alt="Filtered Products - On Sale" width="85%" />
</p>

---

## AI-Powered Search

The frontend supports AI-powered search via natural language queries (e.g. “vomero shoes”). These are parsed by the backend using OpenAI and matched with vector embeddings.

<p align="center">
  <img src="./images/ai_search_vomero_shoes.JPG" alt="AI Search - Vomero Shoes" width="85%" />
</p>

---

## Mobile-First Responsive Layout

The layout gracefully adapts to mobile screens, stacking filters and product cards vertically for optimal UX.

<p align="center">
  <img src="./images/mobile_support_display.JPG" alt="Mobile View" width="45%" />
</p>

---

# Deployment & Hosting

The PH Shoes Data SPA is deployed on [**Render.com**](https://render.com) using Dockerized services for both frontend and backend. The application is live and accessible at:

👉 [https://ph-shoes-frontend.onrender.com/](https://ph-shoes-frontend.onrender.com/)

Both services are built from Docker images and deployed as separate Render web services:

* **Frontend** (React + MUI SPA) is served via NGINX using a static Docker container.
* **Backend** (Spring Boot API) exposes `/api/v1/fact-product-shoes` endpoints with support for both filtered and AI-based queries.

**Note:**
This project is hosted on **Render Free Tier**, so services may spin down when inactive. Initial requests might experience a cold-start delay of \~1-3 minutes, but once warmed up, performance is stable.

