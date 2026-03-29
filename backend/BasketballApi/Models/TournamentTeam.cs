namespace BasketballApi.Models;

public class TournamentTeam
{
    public int Id { get; set; }
    public int TournamentId { get; set; }
    public int TeamId { get; set; }
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament Tournament { get; set; } = null!;
    public Team Team { get; set; } = null!;
}
