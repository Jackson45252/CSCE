using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly AppDbContext _db;
    public PlayersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<PlayerDto>>> GetAll()
    {
        var list = await _db.Players.OrderBy(p => p.Name)
            .Select(p => new PlayerDto(p.Id, p.Name, p.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<PlayerDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<PlayerDto>> Get(int id)
    {
        var p = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        return ApiResponse<PlayerDto>.Ok(new PlayerDto(p.Id, p.Name, p.CreatedAt));
    }

    [HttpPost]
    public async Task<ApiResponse<PlayerDto>> Create(PlayerCreateDto dto)
    {
        var player = new Player { Name = dto.Name };
        _db.Players.Add(player);
        await _db.SaveChangesAsync();
        return ApiResponse<PlayerDto>.Ok(new PlayerDto(player.Id, player.Name, player.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<ApiResponse<PlayerDto>> Update(int id, PlayerUpdateDto dto)
    {
        var player = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        player.Name = dto.Name;
        await _db.SaveChangesAsync();
        return ApiResponse<PlayerDto>.Ok(new PlayerDto(player.Id, player.Name, player.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var player = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        _db.Players.Remove(player);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }
}
