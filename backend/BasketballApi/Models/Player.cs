namespace BasketballApi.Models;

/// <summary>球員</summary>
public class Player
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>球員姓名</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>電子信箱（選填）</summary>
    public string? Email { get; set; }

    /// <summary>備註（選填）</summary>
    public string? Remark { get; set; }

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TeamMember> TeamMembers { get; set; } = [];
    public ICollection<PlayerGameStats> GameStats { get; set; } = [];
    public ICollection<TournamentRoster> TournamentRosters { get; set; } = [];
}
