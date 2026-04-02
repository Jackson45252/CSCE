using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TeamsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<TeamDto>>> GetAll()
    {
        var list = await _db.Teams.OrderBy(t => t.Name)
            .Select(t => new TeamDto(t.Id, t.Name, t.LogoUrl, t.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<TeamDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<TeamDto>> Get(int id)
    {
        var t = await _db.Teams.FindAsync(id) ?? throw new KeyNotFoundException("Team not found");
        return ApiResponse<TeamDto>.Ok(new TeamDto(t.Id, t.Name, t.LogoUrl, t.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost]
    public async Task<ApiResponse<TeamDto>> Create(TeamCreateDto dto)
    {
        var team = new Team { Name = dto.Name, LogoUrl = dto.LogoUrl };
        _db.Teams.Add(team);
        await _db.SaveChangesAsync();
        return ApiResponse<TeamDto>.Ok(new TeamDto(team.Id, team.Name, team.LogoUrl, team.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPut("{id}")]
    public async Task<ApiResponse<TeamDto>> Update(int id, TeamUpdateDto dto)
    {
        var team = await _db.Teams.FindAsync(id) ?? throw new KeyNotFoundException("Team not found");
        team.Name = dto.Name;
        team.LogoUrl = dto.LogoUrl;
        await _db.SaveChangesAsync();
        return ApiResponse<TeamDto>.Ok(new TeamDto(team.Id, team.Name, team.LogoUrl, team.CreatedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var team = await _db.Teams.FindAsync(id) ?? throw new KeyNotFoundException("Team not found");
        _db.Teams.Remove(team);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }

    // --- Games ---
    [HttpGet("{id}/games")]
    public async Task<ApiResponse<List<GameDto>>> GetGames(int id)
    {
        _ = await _db.Teams.FindAsync(id) ?? throw new KeyNotFoundException("Team not found");
        var list = await _db.Games
            .Where(g => g.HomeTeamId == id || g.AwayTeamId == id)
            .Include(g => g.HomeTeam)
            .Include(g => g.AwayTeam)
            .OrderByDescending(g => g.ScheduledAt)
            .Select(g => new GameDto(g.Id, g.TournamentId, g.HomeTeamId, g.HomeTeam.Name,
                g.AwayTeamId, g.AwayTeam.Name, g.ScheduledAt, g.Location,
                g.Status.ToString(), g.HomeScore, g.AwayScore,
                g.HomeQ1, g.HomeQ2, g.HomeQ3, g.HomeQ4, g.HomeOt1, g.HomeOt2,
                g.AwayQ1, g.AwayQ2, g.AwayQ3, g.AwayQ4, g.AwayOt1, g.AwayOt2,
                g.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<GameDto>>.Ok(list);
    }

    // --- Members ---
    [HttpGet("{id}/members")]
    public async Task<ApiResponse<List<TeamMemberDto>>> GetMembers(int id)
    {
        var list = await _db.TeamMembers
            .Where(tm => tm.TeamId == id)
            .Include(tm => tm.Player)
            .OrderBy(tm => tm.JerseyNumber)
            .Select(tm => new TeamMemberDto(tm.Id, tm.PlayerId, tm.Player.Name, tm.JerseyNumber, tm.JoinedAt))
            .ToListAsync();
        return ApiResponse<List<TeamMemberDto>>.Ok(list);
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpPost("{id}/members")]
    public async Task<ApiResponse<TeamMemberDto>> AddMember(int id, TeamMemberCreateDto dto)
    {
        _ = await _db.Teams.FindAsync(id) ?? throw new KeyNotFoundException("Team not found");
        var player = await _db.Players.FindAsync(dto.PlayerId) ?? throw new KeyNotFoundException("Player not found");

        var member = new TeamMember { TeamId = id, PlayerId = dto.PlayerId, JerseyNumber = dto.JerseyNumber };
        _db.TeamMembers.Add(member);
        await _db.SaveChangesAsync();
        return ApiResponse<TeamMemberDto>.Ok(new TeamMemberDto(member.Id, member.PlayerId, player.Name, member.JerseyNumber, member.JoinedAt));
    }

    [Authorize(Roles = "SuperAdmin,TournamentManager")]
    [HttpDelete("{id}/members/{memberId}")]
    public async Task<ApiResponse<string>> RemoveMember(int id, int memberId)
    {
        var member = await _db.TeamMembers.FirstOrDefaultAsync(tm => tm.Id == memberId && tm.TeamId == id)
            ?? throw new KeyNotFoundException("Member not found");
        _db.TeamMembers.Remove(member);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }
}
