namespace BasketballApi.Models;

/// <summary>盃賽分類，例如「春燕盃」、「大專盃」</summary>
public class TournamentCategory
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>分類名稱，例如「春燕盃」</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>說明（選填）</summary>
    public string? Description { get; set; }

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Tournament> Tournaments { get; set; } = [];
}
