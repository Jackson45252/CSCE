namespace BasketballApi.Models;

/// <summary>角色定義（用於權限管理）</summary>
public class Role
{
    /// <summary>主鍵</summary>
    public int Id { get; set; }

    /// <summary>角色名稱，例如「SuperAdmin」（唯一）</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>角色說明</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>建立時間（UTC）</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
