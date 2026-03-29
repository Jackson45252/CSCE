namespace BasketballApi.Models;

public class PlayerGameStats
{
    public int Id { get; set; }
    public int GameId { get; set; }
    public int PlayerId { get; set; }
    public int TeamId { get; set; }

    public int TwoPointAttempts { get; set; }
    public int TwoPointPoints { get; set; }
    public int ThreePointAttempts { get; set; }
    public int ThreePointPoints { get; set; }
    public int FreeThrowAttempts { get; set; }
    public int FreeThrowPoints { get; set; }
    public int TotalPoints { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Game Game { get; set; } = null!;
    public Player Player { get; set; } = null!;
    public Team Team { get; set; } = null!;
}
