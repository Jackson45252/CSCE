using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public NewsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ── Public endpoints ────────────────────────────────────────────────

    [HttpGet]
    public async Task<ApiResponse<List<NewsListItemDto>>> GetAll()
    {
        var list = await _db.News
            .Where(n => n.IsPublished)
            .OrderByDescending(n => n.PublishedAt)
            .Select(n => new NewsListItemDto(
                n.Id,
                n.Title,
                n.IsPublished,
                n.PublishedAt,
                n.CreatedAt,
                n.UpdatedAt,
                n.Attachments.Where(a => a.IsImage).OrderBy(a => a.Id).Select(a => a.FileUrl).FirstOrDefault()))
            .ToListAsync();
        return ApiResponse<List<NewsListItemDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<NewsDto>> Get(int id)
    {
        var news = await _db.News
            .Include(n => n.Attachments)
            .FirstOrDefaultAsync(n => n.Id == id && n.IsPublished)
            ?? throw new KeyNotFoundException($"News {id} not found");

        return ApiResponse<NewsDto>.Ok(ToDto(news));
    }

    // ── Admin endpoints ─────────────────────────────────────────────────

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpGet("admin")]
    public async Task<ApiResponse<List<NewsListItemDto>>> GetAllAdmin()
    {
        var list = await _db.News
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NewsListItemDto(
                n.Id,
                n.Title,
                n.IsPublished,
                n.PublishedAt,
                n.CreatedAt,
                n.UpdatedAt,
                n.Attachments.Where(a => a.IsImage).OrderBy(a => a.Id).Select(a => a.FileUrl).FirstOrDefault()))
            .ToListAsync();
        return ApiResponse<List<NewsListItemDto>>.Ok(list);
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpGet("admin/{id}")]
    public async Task<ApiResponse<NewsDto>> GetAdmin(int id)
    {
        var news = await _db.News
            .Include(n => n.Attachments)
            .FirstOrDefaultAsync(n => n.Id == id)
            ?? throw new KeyNotFoundException($"News {id} not found");

        return ApiResponse<NewsDto>.Ok(ToDto(news));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost]
    public async Task<ApiResponse<NewsDto>> Create([FromBody] NewsCreateDto dto)
    {
        var news = new News
        {
            Title = dto.Title,
            Content = dto.Content,
            IsPublished = dto.IsPublished,
            PublishedAt = dto.PublishedAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.News.Add(news);
        await _db.SaveChangesAsync();
        return ApiResponse<NewsDto>.Ok(ToDto(news));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPut("{id}")]
    public async Task<ApiResponse<NewsDto>> Update(int id, [FromBody] NewsUpdateDto dto)
    {
        var news = await _db.News.Include(n => n.Attachments).FirstOrDefaultAsync(n => n.Id == id)
            ?? throw new KeyNotFoundException($"News {id} not found");

        news.Title = dto.Title;
        news.Content = dto.Content;
        news.IsPublished = dto.IsPublished;
        news.PublishedAt = dto.PublishedAt;
        news.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ApiResponse<NewsDto>.Ok(ToDto(news));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var news = await _db.News.Include(n => n.Attachments).FirstOrDefaultAsync(n => n.Id == id)
            ?? throw new KeyNotFoundException($"News {id} not found");

        foreach (var attachment in news.Attachments)
            DeleteFile(attachment.FilePath);

        _db.News.Remove(news);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }

    // ── Attachment endpoints ─────────────────────────────────────────────

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost("{id}/attachments")]
    public async Task<ApiResponse<List<NewsAttachmentDto>>> UploadAttachments(int id, IFormFileCollection files)
    {
        var news = await _db.News.FindAsync(id)
            ?? throw new KeyNotFoundException($"News {id} not found");

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads", "news", id.ToString());
        Directory.CreateDirectory(uploadDir);

        var result = new List<NewsAttachmentDto>();

        foreach (var file in files)
        {
            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException($"File '{file.FileName}' exceeds the 10 MB limit");

            var ext = Path.GetExtension(file.FileName);
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadDir, uniqueName);
            var fileUrl = $"/uploads/news/{id}/{uniqueName}";

            await using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream);

            var mimeType = file.ContentType;
            var isImage = mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);

            var attachment = new NewsAttachment
            {
                NewsId = id,
                FileName = file.FileName,
                FilePath = filePath,
                FileUrl = fileUrl,
                MimeType = mimeType,
                FileSize = file.Length,
                IsImage = isImage,
                CreatedAt = DateTime.UtcNow
            };
            _db.NewsAttachments.Add(attachment);
            await _db.SaveChangesAsync();

            result.Add(ToAttachmentDto(attachment));
        }

        return ApiResponse<List<NewsAttachmentDto>>.Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}/attachments/{attachmentId}")]
    public async Task<ApiResponse<string>> DeleteAttachment(int id, int attachmentId)
    {
        var attachment = await _db.NewsAttachments
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.NewsId == id)
            ?? throw new KeyNotFoundException($"Attachment {attachmentId} not found");

        DeleteFile(attachment.FilePath);
        _db.NewsAttachments.Remove(attachment);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private static NewsDto ToDto(News n) => new(
        n.Id, n.Title, n.Content, n.IsPublished, n.PublishedAt,
        n.CreatedAt, n.UpdatedAt,
        n.Attachments.OrderBy(a => a.Id).Select(ToAttachmentDto).ToList());

    private static NewsAttachmentDto ToAttachmentDto(NewsAttachment a) => new(
        a.Id, a.FileName, a.FileUrl, a.MimeType, a.FileSize, a.IsImage, a.CreatedAt);

    private static void DeleteFile(string filePath)
    {
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);
    }
}
