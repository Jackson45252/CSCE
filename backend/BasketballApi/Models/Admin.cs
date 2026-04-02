namespace BasketballApi.Models;

/// <summary>後台管理員帳號</summary>
public class Admin
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>登入帳號（唯一）</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>密碼雜湊值（bcrypt）</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>所擁有的角色清單（SuperAdmin | TournamentManager | DataEditor）</summary>
    public string[] Roles { get; set; } = ["SuperAdmin"];

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
