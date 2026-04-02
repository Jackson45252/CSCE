namespace BasketballApi.Models;

public class NewsAttachment
{
    public int Id { get; set; }
    public int NewsId { get; set; }
    public News News { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;   // 原始顯示名稱
    public string FilePath { get; set; } = string.Empty;   // 磁碟路徑
    public string FileUrl { get; set; } = string.Empty;    // 公開 URL
    public string MimeType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public bool IsImage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
