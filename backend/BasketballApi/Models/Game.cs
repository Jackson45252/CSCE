namespace BasketballApi.Models;

/// <summary>比賽狀態</summary>
public enum GameStatus
{
    /// <summary>尚未開打</summary>
    Upcoming,
    /// <summary>已結束（有比分）</summary>
    Finished
}

/// <summary>單場比賽</summary>
public class Game
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>所屬賽事 ID</summary>
    public int TournamentId { get; set; }

    /// <summary>主隊 ID</summary>
    public int HomeTeamId { get; set; }

    /// <summary>客隊 ID</summary>
    public int AwayTeamId { get; set; }

    /// <summary>預定比賽時間（UTC）</summary>
    public DateTime ScheduledAt { get; set; }

    /// <summary>比賽地點（選填）</summary>
    public string? Location { get; set; }

    /// <summary>比賽狀態：Upcoming / Finished</summary>
    public GameStatus Status { get; set; } = GameStatus.Upcoming;

    /// <summary>主隊得分（Finished 後填入）</summary>
    public int? HomeScore { get; set; }

    /// <summary>客隊得分（Finished 後填入）</summary>
    public int? AwayScore { get; set; }

    /// <summary>主隊第一節得分</summary>
    public int? HomeQ1 { get; set; }
    /// <summary>主隊第二節得分</summary>
    public int? HomeQ2 { get; set; }
    /// <summary>主隊第三節得分</summary>
    public int? HomeQ3 { get; set; }
    /// <summary>主隊第四節得分</summary>
    public int? HomeQ4 { get; set; }
    /// <summary>主隊第一延長賽得分</summary>
    public int? HomeOt1 { get; set; }
    /// <summary>主隊第二延長賽得分</summary>
    public int? HomeOt2 { get; set; }

    /// <summary>客隊第一節得分</summary>
    public int? AwayQ1 { get; set; }
    /// <summary>客隊第二節得分</summary>
    public int? AwayQ2 { get; set; }
    /// <summary>客隊第三節得分</summary>
    public int? AwayQ3 { get; set; }
    /// <summary>客隊第四節得分</summary>
    public int? AwayQ4 { get; set; }
    /// <summary>客隊第一延長賽得分</summary>
    public int? AwayOt1 { get; set; }
    /// <summary>客隊第二延長賽得分</summary>
    public int? AwayOt2 { get; set; }

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament Tournament { get; set; } = null!;
    public Team HomeTeam { get; set; } = null!;
    public Team AwayTeam { get; set; } = null!;
    public ICollection<PlayerGameStats> PlayerGameStats { get; set; } = [];
}
