# 籃球數據網站 — Data Schema 設計文件

---

## 實體關係總覽

```
Player ──< TeamMember >── Team ──< TournamentTeam >── Tournament
                                                            │
                                                          Game
                                                            │
                                                   PlayerGameStats
```

---

## 1. Player（選手）

| 欄位名稱       | 型別         | 說明             | 備註             |
|--------------|-------------|-----------------|-----------------|
| id           | UUID / INT  | 主鍵             |                  |
| name         | VARCHAR(50) | 選手姓名          | NOT NULL         |
| created_at   | DATETIME    | 建立時間          | DEFAULT NOW()    |

---

## 2. Team（隊伍）

| 欄位名稱       | 型別          | 說明             | 備註             |
|--------------|--------------|-----------------|-----------------|
| id           | UUID / INT   | 主鍵             |                  |
| name         | VARCHAR(100) | 隊伍名稱          | NOT NULL, UNIQUE |
| logo_url     | VARCHAR(255) | 隊伍 Logo 圖片網址 | 可選             |
| created_at   | DATETIME     | 建立時間          | DEFAULT NOW()    |

---

## 3. TeamMember（隊伍成員）

> 記錄選手與隊伍的對應關係（多對多中間表）

| 欄位名稱       | 型別        | 說明             | 備註                        |
|--------------|------------|-----------------|---------------------------|
| id           | UUID / INT | 主鍵             |                             |
| team_id      | FK → Team  | 所屬隊伍          | NOT NULL                   |
| player_id    | FK → Player| 選手             | NOT NULL                   |
| jersey_number| INT        | 背號（依隊伍不同）  | 可選                        |
| joined_at    | DATETIME   | 加入時間          | DEFAULT NOW()               |

- **唯一限制**：`(team_id, player_id)` 不可重複
- **唯一限制**：`(team_id, jersey_number)` 同一隊內背號不可重複

---

## 4. Tournament（盃賽）

| 欄位名稱       | 型別          | 說明                     | 備註          |
|--------------|--------------|-------------------------|--------------|
| id           | UUID / INT   | 主鍵                     |               |
| name         | VARCHAR(100) | 盃賽名稱（如：2026年度熱血盃賽）| NOT NULL      |
| season       | VARCHAR(20)  | 季度（如：2026）           | NOT NULL      |
| start_date   | DATE         | 開始日期                  |               |
| end_date     | DATE         | 結束日期                  |               |
| status       | ENUM         | 盃賽狀態                  | 見下方狀態說明  |
| created_at   | DATETIME     | 建立時間                  | DEFAULT NOW() |

**status 列舉值：**
- `upcoming` — 即將開始
- `ongoing` — 進行中
- `finished` — 已結束

---

## 5. TournamentTeam（盃賽參賽隊伍）

> 記錄哪些隊伍加入了哪個盃賽（多對多中間表）

| 欄位名稱          | 型別               | 說明       | 備註                   |
|-----------------|-------------------|-----------|----------------------|
| id              | UUID / INT        | 主鍵       |                       |
| tournament_id   | FK → Tournament   | 所屬盃賽   | NOT NULL              |
| team_id         | FK → Team         | 參賽隊伍   | NOT NULL              |
| registered_at   | DATETIME          | 報名時間   | DEFAULT NOW()         |

- **唯一限制**：`(tournament_id, team_id)` 不可重複

---

## 6. Game（賽程）

| 欄位名稱          | 型別               | 說明             | 備註           |
|-----------------|-------------------|-----------------|---------------|
| id              | UUID / INT        | 主鍵             |               |
| tournament_id   | FK → Tournament   | 所屬盃賽          | NOT NULL      |
| home_team_id    | FK → Team         | 主隊             | NOT NULL      |
| away_team_id    | FK → Team         | 客隊             | NOT NULL      |
| scheduled_at    | DATETIME          | 比賽時間          | NOT NULL      |
| location        | VARCHAR(100)      | 比賽地點          |               |
| status          | ENUM              | 比賽狀態          | 見下方狀態說明  |
| home_score      | INT               | 主隊總得分        | status=finished 時填入 |
| away_score      | INT               | 客隊總得分        | status=finished 時填入 |
| created_at      | DATETIME          | 建立時間          | DEFAULT NOW() |

**status 列舉值：**
- `upcoming` — 即將開始
- `finished` — 已結束

---

## 7. PlayerGameStats（選手單場比賽數據）

> 每位選手在每場比賽中的詳細數據，是計算排名的基礎資料

| 欄位名稱               | 型別           | 說明              | 備註                          |
|----------------------|---------------|------------------|------------------------------|
| id                   | UUID / INT    | 主鍵              |                               |
| game_id              | FK → Game     | 所屬賽程           | NOT NULL                      |
| player_id            | FK → Player   | 選手              | NOT NULL                      |
| team_id              | FK → Team     | 選手當場代表隊伍    | NOT NULL                      |
| two_point_attempts   | INT           | 二分球出手次數      | DEFAULT 0                     |
| two_point_points     | INT           | 二分球得分         | DEFAULT 0（每進一球 +2 分）    |
| three_point_attempts | INT           | 三分球出手次數      | DEFAULT 0                     |
| three_point_points   | INT           | 三分球得分         | DEFAULT 0（每進一球 +3 分）    |
| free_throw_attempts  | INT           | 罰球次數           | DEFAULT 0                     |
| free_throw_points    | INT           | 罰球得分           | DEFAULT 0（每進一球 +1 分）    |
| total_points         | INT           | 單場總得分         | = 二分球得分 + 三分球得分 + 罰球得分 |
| created_at           | DATETIME      | 建立時間           | DEFAULT NOW()                 |

- **唯一限制**：`(game_id, player_id)` 每位選手每場只能有一筆數據

---

## 8. 衍生資料：盃賽得分排行榜（Leaderboard）

> 此為**查詢視圖（View）或計算結果**，非獨立資料表。
> 透過 PlayerGameStats 聚合運算得出。

**查詢邏輯：**

```sql
SELECT
    p.id            AS player_id,
    p.name          AS player_name,
    t.name          AS team_name,
    SUM(pgs.total_points) AS tournament_total_points
FROM PlayerGameStats pgs
JOIN Game g         ON pgs.game_id     = g.id
JOIN Player p       ON pgs.player_id   = p.id
JOIN Team t         ON pgs.team_id     = t.id
WHERE g.tournament_id = :tournament_id
GROUP BY p.id, p.name, t.name
ORDER BY tournament_total_points DESC;
```

**回傳欄位說明：**

| 欄位名稱                   | 說明              |
|--------------------------|-----------------|
| player_id                | 選手 ID           |
| player_name              | 選手姓名          |
| team_name                | 所屬隊伍          |
| tournament_total_points  | 盃賽累計總得分     |

---

## 9. 衍生資料：隊伍在盃賽中的選手累計數據（Team Tournament Stats）

> 此為**查詢視圖（View）或計算結果**，非獨立資料表。
> 輸入參數：指定盃賽（`tournament_id`）+ 指定隊伍（`team_id`），
> 回傳該隊伍每位選手在此盃賽所有已結束賽程的累計數據。

**查詢邏輯：**

```sql
SELECT
    p.id                              AS player_id,
    p.name                            AS player_name,
    tm.jersey_number                  AS jersey_number,
    COUNT(DISTINCT pgs.game_id)       AS games_played,

    SUM(pgs.two_point_attempts)       AS total_two_point_attempts,
    SUM(pgs.two_point_points)         AS total_two_point_points,

    SUM(pgs.three_point_attempts)     AS total_three_point_attempts,
    SUM(pgs.three_point_points)       AS total_three_point_points,

    SUM(pgs.free_throw_attempts)      AS total_free_throw_attempts,
    SUM(pgs.free_throw_points)        AS total_free_throw_points,

    SUM(pgs.total_points)             AS tournament_total_points
FROM PlayerGameStats pgs
JOIN Game g         ON pgs.game_id     = g.id
JOIN Player p       ON pgs.player_id   = p.id
JOIN TeamMember tm  ON tm.player_id    = p.id AND tm.team_id = :team_id
WHERE g.tournament_id = :tournament_id
  AND pgs.team_id     = :team_id
  AND g.status        = 'finished'
GROUP BY p.id, p.name, tm.jersey_number
ORDER BY tournament_total_points DESC;
```

**回傳欄位說明：**

| 欄位名稱                     | 說明                          |
|----------------------------|------------------------------|
| player_id                  | 選手 ID                       |
| player_name                | 選手姓名                      |
| jersey_number              | 背號                          |
| games_played               | 出賽場數                      |
| total_two_point_attempts   | 盃賽累計二分球出手次數          |
| total_two_point_points     | 盃賽累計二分球得分              |
| total_three_point_attempts | 盃賽累計三分球出手次數          |
| total_three_point_points   | 盃賽累計三分球得分              |
| total_free_throw_attempts  | 盃賽累計罰球次數               |
| total_free_throw_points    | 盃賽累計罰球得分               |
| tournament_total_points    | 盃賽累計總得分                 |

**注意事項：**
- 僅統計 `status = 'finished'` 的賽程，未開始或進行中的比賽不計入
- 若選手未上場（無 `PlayerGameStats` 記錄），該場不計入 `games_played`
- 可加入 `HAVING games_played > 0` 過濾掉零出賽選手

---

## Schema 關聯圖（文字版）

```
Tournament
  ├── TournamentTeam (N) ── Team (1)
  │                          └── TeamMember (N) ── Player (1)
  └── Game (N)
        ├── home_team_id → Team
        ├── away_team_id → Team
        └── PlayerGameStats (N)
              ├── player_id → Player
              └── team_id  → Team
```

---

## 各實體數量關係摘要

| 關係                         | 類型   |
|-----------------------------|--------|
| Team ↔ Player               | 多對多（透過 TeamMember）     |
| Tournament ↔ Team           | 多對多（透過 TournamentTeam） |
| Tournament → Game           | 一對多                        |
| Game → PlayerGameStats      | 一對多                        |
| Player → PlayerGameStats    | 一對多                        |
