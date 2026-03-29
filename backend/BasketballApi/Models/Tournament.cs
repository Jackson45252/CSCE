namespace BasketballApi.Models;

public enum TournamentStatus
{
    Upcoming,
    Ongoing,
    Finished
}

public class Tournament
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public TournamentStatus Status { get; set; } = TournamentStatus.Upcoming;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TournamentTeam> TournamentTeams { get; set; } = [];
    public ICollection<Game> Games { get; set; } = [];
}
