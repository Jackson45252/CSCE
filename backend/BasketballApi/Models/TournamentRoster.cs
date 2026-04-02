namespace BasketballApi.Models;

/// <summary>賽事出賽名單（某賽事中某隊伍的球員名單）</summary>
public class TournamentRoster
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>所屬賽事隊伍 ID（對應 TournamentTeam）</summary>
    public int TournamentTeamId { get; set; }

    /// <summary>球員 ID</summary>
    public int PlayerId { get; set; }

    /// <summary>本次賽事使用的球衣號碼（選填，同隊同賽事內不可重複）</summary>
    public int? JerseyNumber { get; set; }

    /// <summary>加入名單時間（UTC）</summary>
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public TournamentTeam TournamentTeam { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
