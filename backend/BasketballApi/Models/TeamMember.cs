namespace BasketballApi.Models;

/// <summary>球隊成員（球員與球隊的多對多關聯）</summary>
public class TeamMember
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>所屬球隊 ID</summary>
    public int TeamId { get; set; }

    /// <summary>球員 ID</summary>
    public int PlayerId { get; set; }

    /// <summary>球衣號碼（選填，同隊內不可重複）</summary>
    public int? JerseyNumber { get; set; }

    /// <summary>加入球隊時間（UTC）</summary>
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Team Team { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
