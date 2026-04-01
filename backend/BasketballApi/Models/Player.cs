namespace BasketballApi.Models;

public class Player
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Remark { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TeamMember> TeamMembers { get; set; } = [];
    public ICollection<PlayerGameStats> GameStats { get; set; } = [];
    public ICollection<TournamentRoster> TournamentRosters { get; set; } = [];
}
