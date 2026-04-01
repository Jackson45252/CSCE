namespace BasketballApi.Models;

public class TournamentRoster
{
    public int Id { get; set; }
    public int TournamentTeamId { get; set; }
    public int PlayerId { get; set; }
    public int? JerseyNumber { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public TournamentTeam TournamentTeam { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
