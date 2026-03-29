namespace BasketballApi.Models;

public class TeamMember
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public int PlayerId { get; set; }
    public int? JerseyNumber { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Team Team { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
