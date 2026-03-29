namespace BasketballApi.Models;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TeamMember> TeamMembers { get; set; } = [];
    public ICollection<TournamentTeam> TournamentTeams { get; set; } = [];
    public ICollection<Game> HomeGames { get; set; } = [];
    public ICollection<Game> AwayGames { get; set; } = [];
}
