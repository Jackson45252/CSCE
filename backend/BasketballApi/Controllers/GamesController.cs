using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _db;
    public GamesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<GameDto>>> GetAll([FromQuery] int? tournamentId)
    {
        var query = _db.Games.Include(g => g.HomeTeam).Include(g => g.AwayTeam).AsQueryable();
        if (tournamentId.HasValue) query = query.Where(g => g.TournamentId == tournamentId.Value);

        var list = await query.OrderByDescending(g => g.ScheduledAt)
            .Select(g => new GameDto(g.Id, g.TournamentId, g.HomeTeamId, g.HomeTeam.Name,
                g.AwayTeamId, g.AwayTeam.Name, g.ScheduledAt, g.Location, g.Status.ToString(),
                g.HomeScore, g.AwayScore, g.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<GameDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<GameDto>> Get(int id)
    {
        var g = await _db.Games.Include(g => g.HomeTeam).Include(g => g.AwayTeam)
            .FirstOrDefaultAsync(g => g.Id == id) ?? throw new KeyNotFoundException("Game not found");
        return ApiResponse<GameDto>.Ok(new GameDto(g.Id, g.TournamentId, g.HomeTeamId, g.HomeTeam.Name,
            g.AwayTeamId, g.AwayTeam.Name, g.ScheduledAt, g.Location, g.Status.ToString(),
            g.HomeScore, g.AwayScore, g.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost]
    public async Task<ApiResponse<GameDto>> Create(GameCreateDto dto)
    {
        if (dto.HomeTeamId == dto.AwayTeamId)
            throw new ArgumentException("Home team and away team cannot be the same");

        var homeTeam = await _db.Teams.FindAsync(dto.HomeTeamId) ?? throw new KeyNotFoundException("Home team not found");
        var awayTeam = await _db.Teams.FindAsync(dto.AwayTeamId) ?? throw new KeyNotFoundException("Away team not found");

        var game = new Game
        {
            TournamentId = dto.TournamentId,
            HomeTeamId = dto.HomeTeamId,
            AwayTeamId = dto.AwayTeamId,
            ScheduledAt = DateTime.SpecifyKind(dto.ScheduledAt, DateTimeKind.Utc),
            Location = dto.Location
        };
        _db.Games.Add(game);
        await _db.SaveChangesAsync();
        return ApiResponse<GameDto>.Ok(new GameDto(game.Id, game.TournamentId, game.HomeTeamId, homeTeam.Name,
            game.AwayTeamId, awayTeam.Name, game.ScheduledAt, game.Location, game.Status.ToString(),
            game.HomeScore, game.AwayScore, game.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPut("{id}")]
    public async Task<ApiResponse<GameDto>> Update(int id, GameUpdateDto dto)
    {
        var g = await _db.Games.Include(g => g.HomeTeam).Include(g => g.AwayTeam)
            .FirstOrDefaultAsync(g => g.Id == id) ?? throw new KeyNotFoundException("Game not found");
        g.ScheduledAt = DateTime.SpecifyKind(dto.ScheduledAt, DateTimeKind.Utc);
        g.Location = dto.Location;
        g.Status = Enum.Parse<GameStatus>(dto.Status, true);
        g.HomeScore = dto.HomeScore;
        g.AwayScore = dto.AwayScore;
        await _db.SaveChangesAsync();
        return ApiResponse<GameDto>.Ok(new GameDto(g.Id, g.TournamentId, g.HomeTeamId, g.HomeTeam.Name,
            g.AwayTeamId, g.AwayTeam.Name, g.ScheduledAt, g.Location, g.Status.ToString(),
            g.HomeScore, g.AwayScore, g.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var g = await _db.Games.FindAsync(id) ?? throw new KeyNotFoundException("Game not found");
        _db.Games.Remove(g);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }

    // --- 3.3 Box Score ---
    [HttpGet("{id}/boxscore")]
    public async Task<ApiResponse<List<BoxScoreEntryDto>>> GetBoxScore(int id)
    {
        var list = await (
            from s in _db.PlayerGameStats.Where(s => s.GameId == id)
            join tm in _db.TeamMembers
                on new { s.PlayerId, s.TeamId } equals new { tm.PlayerId, tm.TeamId }
                into tmGroup
            from tm in tmGroup.DefaultIfEmpty()
            orderby s.TotalPoints descending
            select new BoxScoreEntryDto(
                s.PlayerId, s.Player.Name, s.TeamId, s.Team.Name,
                tm == null ? null : tm.JerseyNumber,
                s.TwoPointAttempts, s.TwoPointPoints,
                s.ThreePointAttempts, s.ThreePointPoints,
                s.FreeThrowAttempts, s.FreeThrowPoints,
                s.TotalPoints)
        ).ToListAsync();
        return ApiResponse<List<BoxScoreEntryDto>>.Ok(list);
    }
}
