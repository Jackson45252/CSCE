using Microsoft.AspNetCore.Authorization;
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
            .Select(p => new PlayerDto(p.Id, p.Name, p.Email, p.Remark, p.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<PlayerDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<PlayerDto>> Get(int id)
    {
        var p = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        return ApiResponse<PlayerDto>.Ok(new PlayerDto(p.Id, p.Name, p.Email, p.Remark, p.CreatedAt));
    }

    [HttpGet("{id}/teams")]
    public async Task<ApiResponse<List<PlayerTeamDto>>> GetTeams(int id)
    {
        _ = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        var list = await _db.TeamMembers
            .Where(tm => tm.PlayerId == id)
            .Include(tm => tm.Team)
            .OrderBy(tm => tm.JoinedAt)
            .Select(tm => new PlayerTeamDto(tm.TeamId, tm.Team.Name, tm.JerseyNumber, tm.JoinedAt))
            .ToListAsync();
        return ApiResponse<List<PlayerTeamDto>>.Ok(list);
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost]
    public async Task<ApiResponse<PlayerDto>> Create(PlayerCreateDto dto)
    {
        var player = new Player { Name = dto.Name, Email = dto.Email, Remark = dto.Remark };
        _db.Players.Add(player);
        await _db.SaveChangesAsync();
        return ApiResponse<PlayerDto>.Ok(new PlayerDto(player.Id, player.Name, player.Email, player.Remark, player.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPut("{id}")]
    public async Task<ApiResponse<PlayerDto>> Update(int id, PlayerUpdateDto dto)
    {
        var player = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        player.Name = dto.Name;
        player.Email = dto.Email;
        player.Remark = dto.Remark;
        await _db.SaveChangesAsync();
        return ApiResponse<PlayerDto>.Ok(new PlayerDto(player.Id, player.Name, player.Email, player.Remark, player.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var player = await _db.Players.FindAsync(id) ?? throw new KeyNotFoundException("Player not found");
        _db.Players.Remove(player);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }
}
