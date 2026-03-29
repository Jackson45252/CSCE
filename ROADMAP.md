# Basketball Data Website — ROADMAP

> 根據 `basketball-data-schema.md` 規劃的完整開發路線圖。
> 每項任務完成後標記 `[Done]`，未完成為 `[ ]`。

### 開發守則

1. **最小讀取原則**：每次僅讀取當前任務相關的檔案；若需參考其他模組，僅讀取其介面定義（Interface / DTO / Contract），不讀取完整實作。
2. **Session 存檔機制**：當對話紀錄過長（接近 Context 上限），自動將當前進度寫入 ROADMAP.md 與 Memory，提醒使用者存檔並重啟 Session。

---

## Phase 0：專案初始化

- [Done] **0.1** 建立 Monorepo 目錄結構（`/backend`、`/frontend`）
- [Done] **0.2** 後端專案初始化（ASP.NET Core Web API + C#）
- [Done] **0.3** 前端專案初始化（React + TypeScript + Vite）
- [Done] **0.4** 設定程式碼風格規則（後端 `.editorconfig`；前端 ESLint + Prettier）
- [Done] **0.5** 建立 `.gitignore`

---

## Phase 1：資料庫設計與建置

- [Done] **1.1** 選定 ORM（Entity Framework Core）並初始化 DbContext
- [Done] **1.2** 定義 Entity：Player、Team、TeamMember
- [Done] **1.3** 定義 Entity：Tournament、TournamentTeam
- [Done] **1.4** 定義 Entity：Game、PlayerGameStats
- [Done] **1.5** 設定 Fluent API：唯一索引、外鍵約束、Enum 映射
- [Done] **1.6** 撰寫 Seed Data（示範用測試資料）
- [Done] **1.7** 執行 EF Core Migration 並驗證資料庫結構

---

## Phase 2：後端 API — 基礎 CRUD

- [Done] **2.1** 建立統一 API 回應格式（ApiResponse<T>）與全域例外處理 Middleware
- [Done] **2.2** Player API — Controller / Service / Repository（GET / POST / PUT / DELETE）
- [Done] **2.3** Team API（CRUD + 成員管理 `/api/teams/{id}/members`）
- [Done] **2.4** Tournament API（CRUD + 參賽隊伍管理 `/api/tournaments/{id}/teams`）
- [Done] **2.5** Game API（CRUD，含主客隊驗證）
- [Done] **2.6** PlayerGameStats API（CRUD + total_points 自動計算）

---

## Phase 3：後端 API — 衍生查詢與統計

- [Done] **3.1** 盃賽得分排行榜 API（`GET /api/tournaments/{id}/leaderboard`）
- [Done] **3.2** 隊伍盃賽累計數據 API（`GET /api/tournaments/{id}/teams/{teamId}/stats`）
- [Done] **3.3** 單場比賽 Box Score API（`GET /api/games/{id}/boxscore`）

---

## Phase 4：前端 — 基礎架構與路由

- [Done] **4.1** 設定 React Router 路由結構
- [Done] **4.2** 建立共用 Layout（Header、Sidebar、Footer）
- [Done] **4.3** 設定 API Client（Axios / Fetch 封裝）
- [Done] **4.4** 設定全域狀態管理（TanStack Query）

---

## Phase 5：前端 — 各功能頁面

- [Done] **5.1** 首頁 — 盃賽列表與狀態篩選
- [Done] **5.2** 盃賽詳情頁 — 參賽隊伍 + 賽程表
- [Done] **5.3** 賽程詳情頁 — Box Score 呈現
- [Done] **5.4** 隊伍詳情頁 — 隊員列表 + 盃賽累計數據
- [Done] **5.5** 選手詳情頁 — 所屬隊伍 + 各場數據
- [Done] **5.6** 排行榜頁面 — 盃賽得分排名表格（可排序）

---

## Phase 6：前端 — 管理後台（資料維護）

- [Done] **6.1** 選手管理（新增 / 編輯 / 刪除）
- [Done] **6.2** 隊伍管理（新增 / 編輯 / 成員增刪）
- [Done] **6.3** 盃賽管理（新增 / 編輯 / 隊伍報名）
- [Done] **6.4** 賽程管理（新增 / 編輯 / 狀態更新）
- [Done] **6.5** 比賽數據登錄（PlayerGameStats 表單）

---

## Phase 7：UI / UX 強化

- [Done] **7.1** 響應式設計（Mobile / Tablet / Desktop）
- [Done] **7.2** 資料表格：分頁、排序、搜尋
- [Done] **7.3** Loading 狀態與 Error Boundary
- [Done] **7.4** 空資料狀態（Empty State）處理

---

## Phase 8：測試

- [Done] **8.1** 後端單元測試（xUnit，核心邏輯 + Seed 驗證）— 3 passed
- [Done] **8.2** 後端整合測試（WebApplicationFactory + SQLite）— 8 passed
- [Done] **8.3** 前端元件測試（Vitest + React Testing Library）— 需手動 `npm install` 測試依賴

---

## Phase 9：部署與上線

- [ ] **9.1** Docker Compose 設定（DB + Backend + Frontend）
- [ ] **9.2** 環境變數管理（`appsettings.Development.json` / `.env.example`）
- [ ] **9.3** 建立 CI/CD Pipeline（GitHub Actions）
- [ ] **9.4** 正式環境部署

---

## 技術棧摘要

| 層級     | 技術選型                                      |
|---------|----------------------------------------------|
| 前端     | React + TypeScript + Vite + TanStack Query    |
| 後端     | ASP.NET Core 8 Web API + C#                   |
| ORM     | Entity Framework Core                         |
| 資料庫   | PostgreSQL                                    |
| 樣式     | Tailwind CSS                                  |
| 測試     | xUnit + Moq / Vitest + React Testing Library  |
| 部署     | Docker + GitHub Actions                       |
