namespace BasketballApi.Models;

/// <summary>賽事參賽隊伍（賽事與球隊的多對多關聯）</summary>
public class TournamentTeam
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>所屬賽事 ID</summary>
    public int TournamentId { get; set; }

    /// <summary>參賽球隊 ID</summary>
    public int TeamId { get; set; }

    /// <summary>報名時間（UTC）</summary>
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament Tournament { get; set; } = null!;
    public Team Team { get; set; } = null!;
    public ICollection<TournamentRoster> TournamentRosters { get; set; } = [];
}
