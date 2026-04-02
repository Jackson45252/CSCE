namespace BasketballApi.Models;

/// <summary>賽事狀態</summary>
public enum TournamentStatus
{
    /// <summary>尚未開始</summary>
    Upcoming,
    /// <summary>進行中</summary>
    Ongoing,
    /// <summary>已結束</summary>
    Finished
}

/// <summary>賽事（錦標賽／盃賽）</summary>
public class Tournament
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>賽事名稱，例如「115年春燕盃」</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>賽季代號，例如「2026」</summary>
    public string Season { get; set; } = string.Empty;

    /// <summary>所屬盃賽分類（選填）</summary>
    public int? CategoryId { get; set; }
    public TournamentCategory? Category { get; set; }

    /// <summary>賽事開始日期（選填）</summary>
    public DateOnly? StartDate { get; set; }

    /// <summary>賽事結束日期（選填）</summary>
    public DateOnly? EndDate { get; set; }

    /// <summary>賽事狀態：Upcoming / Ongoing / Finished</summary>
    public TournamentStatus Status { get; set; } = TournamentStatus.Upcoming;

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TournamentTeam> TournamentTeams { get; set; } = [];
    public ICollection<Game> Games { get; set; } = [];
}
