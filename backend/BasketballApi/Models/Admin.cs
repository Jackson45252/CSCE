namespace BasketballApi.Models;

public class Admin
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string[] Roles { get; set; } = ["SuperAdmin"]; // SuperAdmin | TournamentManager | DataEditor
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
