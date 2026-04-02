using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/tournament-categories")]
public class TournamentCategoriesController : ControllerBase
{
    private readonly AppDbContext _db;
    public TournamentCategoriesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<TournamentCategoryDto>>> GetAll()
    {
        var list = await _db.TournamentCategories
            .OrderBy(c => c.Name)
            .Select(c => new TournamentCategoryDto(c.Id, c.Name, c.Description, c.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<TournamentCategoryDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<TournamentCategoryDto>> Get(int id)
    {
        var c = await _db.TournamentCategories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        return ApiResponse<TournamentCategoryDto>.Ok(new TournamentCategoryDto(c.Id, c.Name, c.Description, c.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost]
    public async Task<ApiResponse<TournamentCategoryDto>> Create(TournamentCategoryCreateDto dto)
    {
        var category = new TournamentCategory { Name = dto.Name, Description = dto.Description };
        _db.TournamentCategories.Add(category);
        await _db.SaveChangesAsync();
        return ApiResponse<TournamentCategoryDto>.Ok(new TournamentCategoryDto(category.Id, category.Name, category.Description, category.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPut("{id}")]
    public async Task<ApiResponse<TournamentCategoryDto>> Update(int id, TournamentCategoryUpdateDto dto)
    {
        var c = await _db.TournamentCategories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        c.Name = dto.Name;
        c.Description = dto.Description;
        await _db.SaveChangesAsync();
        return ApiResponse<TournamentCategoryDto>.Ok(new TournamentCategoryDto(c.Id, c.Name, c.Description, c.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var c = await _db.TournamentCategories.FindAsync(id) ?? throw new KeyNotFoundException("Category not found");
        _db.TournamentCategories.Remove(c);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }
}
