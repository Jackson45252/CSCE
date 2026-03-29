namespace BasketballApi.Models;

public enum GameStatus
{
    Upcoming,
    Finished
}

public class Game
{
    public int Id { get; set; }
    public int TournamentId { get; set; }
    public int HomeTeamId { get; set; }
    public int AwayTeamId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string? Location { get; set; }
    public GameStatus Status { get; set; } = GameStatus.Upcoming;
    public int? HomeScore { get; set; }
    public int? AwayScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament Tournament { get; set; } = null!;
    public Team HomeTeam { get; set; } = null!;
    public Team AwayTeam { get; set; } = null!;
    public ICollection<PlayerGameStats> PlayerGameStats { get; set; } = [];
}
