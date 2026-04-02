namespace BasketballApi.Models;

/// <summary>球員單場比賽數據</summary>
public class PlayerGameStats
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>所屬比賽 ID</summary>
    public int GameId { get; set; }

    /// <summary>球員 ID</summary>
    public int PlayerId { get; set; }

    /// <summary>出賽隊伍 ID</summary>
    public int TeamId { get; set; }

    /// <summary>兩分球出手次數</summary>
    public int TwoPointAttempts { get; set; }

    /// <summary>兩分球得分（進球數 × 2）</summary>
    public int TwoPointPoints { get; set; }

    /// <summary>三分球出手次數</summary>
    public int ThreePointAttempts { get; set; }

    /// <summary>三分球得分（進球數 × 3）</summary>
    public int ThreePointPoints { get; set; }

    /// <summary>罰球出手次數</summary>
    public int FreeThrowAttempts { get; set; }

    /// <summary>罰球得分（進球數 × 1）</summary>
    public int FreeThrowPoints { get; set; }

    /// <summary>本場總得分（TwoPointPoints + ThreePointPoints + FreeThrowPoints）</summary>
    public int TotalPoints { get; set; }

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Game Game { get; set; } = null!;
    public Player Player { get; set; } = null!;
    public Team Team { get; set; } = null!;
}
