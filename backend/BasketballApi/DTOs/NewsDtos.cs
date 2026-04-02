namespace BasketballApi.DTOs;

public record NewsAttachmentDto(
    int Id,
    string FileName,
    string FileUrl,
    string MimeType,
    long FileSize,
    bool IsImage,
    DateTime CreatedAt);

public record NewsListItemDto(
    int Id,
    string Title,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? CoverImageUrl);

public record NewsDto(
    int Id,
    string Title,
    string Content,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<NewsAttachmentDto> Attachments);

public record NewsCreateDto(string Title, string Content, bool IsPublished, DateTime? PublishedAt);

public record NewsUpdateDto(string Title, string Content, bool IsPublished, DateTime? PublishedAt);
