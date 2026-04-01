using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerGameStatsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PlayerGameStatsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<StatsDto>>> GetAll([FromQuery] int? gameId)
    {
        var query = _db.PlayerGameStats.Include(s => s.Player).Include(s => s.Team).AsQueryable();
        if (gameId.HasValue) query = query.Where(s => s.GameId == gameId.Value);

        var list = await query.OrderByDescending(s => s.TotalPoints)
            .Select(s => new StatsDto(s.Id, s.GameId, s.PlayerId, s.Player.Name, s.TeamId, s.Team.Name,
                s.TwoPointAttempts, s.TwoPointPoints, s.ThreePointAttempts, s.ThreePointPoints,
                s.FreeThrowAttempts, s.FreeThrowPoints, s.TotalPoints, s.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<StatsDto>>.Ok(list);
    }

    [Authorize(Roles = "SuperAdmin,DataEditor")]
    [HttpPost]
    public async Task<ApiResponse<StatsDto>> Create(StatsCreateDto dto)
    {
        var player = await _db.Players.FindAsync(dto.PlayerId) ?? throw new KeyNotFoundException("Player not found");
        var team = await _db.Teams.FindAsync(dto.TeamId) ?? throw new KeyNotFoundException("Team not found");

        var stats = new PlayerGameStats
        {
            GameId = dto.GameId,
            PlayerId = dto.PlayerId,
            TeamId = dto.TeamId,
            TwoPointAttempts = dto.TwoPointAttempts,
            TwoPointPoints = dto.TwoPointPoints,
            ThreePointAttempts = dto.ThreePointAttempts,
            ThreePointPoints = dto.ThreePointPoints,
            FreeThrowAttempts = dto.FreeThrowAttempts,
            FreeThrowPoints = dto.FreeThrowPoints,
            TotalPoints = dto.TwoPointPoints * 2 + dto.ThreePointPoints * 3 + dto.FreeThrowPoints
        };
        _db.PlayerGameStats.Add(stats);
        await _db.SaveChangesAsync();
        return ApiResponse<StatsDto>.Ok(new StatsDto(stats.Id, stats.GameId, stats.PlayerId, player.Name,
            stats.TeamId, team.Name, stats.TwoPointAttempts, stats.TwoPointPoints,
            stats.ThreePointAttempts, stats.ThreePointPoints, stats.FreeThrowAttempts, stats.FreeThrowPoints,
            stats.TotalPoints, stats.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,DataEditor")]
    [HttpPut("{id}")]
    public async Task<ApiResponse<StatsDto>> Update(int id, StatsUpdateDto dto)
    {
        var s = await _db.PlayerGameStats.Include(s => s.Player).Include(s => s.Team)
            .FirstOrDefaultAsync(s => s.Id == id) ?? throw new KeyNotFoundException("Stats not found");
        s.TwoPointAttempts = dto.TwoPointAttempts;
        s.TwoPointPoints = dto.TwoPointPoints;
        s.ThreePointAttempts = dto.ThreePointAttempts;
        s.ThreePointPoints = dto.ThreePointPoints;
        s.FreeThrowAttempts = dto.FreeThrowAttempts;
        s.FreeThrowPoints = dto.FreeThrowPoints;
        s.TotalPoints = dto.TwoPointPoints * 2 + dto.ThreePointPoints * 3 + dto.FreeThrowPoints;
        await _db.SaveChangesAsync();
        return ApiResponse<StatsDto>.Ok(new StatsDto(s.Id, s.GameId, s.PlayerId, s.Player.Name,
            s.TeamId, s.Team.Name, s.TwoPointAttempts, s.TwoPointPoints,
            s.ThreePointAttempts, s.ThreePointPoints, s.FreeThrowAttempts, s.FreeThrowPoints,
            s.TotalPoints, s.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,DataEditor")]
    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var s = await _db.PlayerGameStats.FindAsync(id) ?? throw new KeyNotFoundException("Stats not found");
        _db.PlayerGameStats.Remove(s);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }
}
