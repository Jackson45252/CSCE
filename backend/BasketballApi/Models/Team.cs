namespace BasketballApi.Models;

/// <summary>球隊</summary>
public class Team
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>隊伍名稱（唯一）</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>隊伍 Logo 圖片網址（選填）</summary>
    public string? LogoUrl { get; set; }

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TeamMember> TeamMembers { get; set; } = [];
    public ICollection<TournamentTeam> TournamentTeams { get; set; } = [];
    public ICollection<Game> HomeGames { get; set; } = [];
    public ICollection<Game> AwayGames { get; set; } = [];
}
