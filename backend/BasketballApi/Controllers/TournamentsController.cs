using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TournamentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<TournamentDto>>> GetAll()
    {
        var list = await _db.Tournaments.OrderByDescending(t => t.Season)
            .Select(t => new TournamentDto(t.Id, t.Name, t.Season, t.StartDate, t.EndDate, t.Status.ToString(), t.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<TournamentDto>>.Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<ApiResponse<TournamentDto>> Get(int id)
    {
        var t = await _db.Tournaments.FindAsync(id) ?? throw new KeyNotFoundException("Tournament not found");
        return ApiResponse<TournamentDto>.Ok(new TournamentDto(t.Id, t.Name, t.Season, t.StartDate, t.EndDate, t.Status.ToString(), t.CreatedAt));
    }

    [HttpPost]
    public async Task<ApiResponse<TournamentDto>> Create(TournamentCreateDto dto)
    {
        var tournament = new Tournament
        {
            Name = dto.Name,
            Season = dto.Season,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = Enum.Parse<TournamentStatus>(dto.Status, true)
        };
        _db.Tournaments.Add(tournament);
        await _db.SaveChangesAsync();
        return ApiResponse<TournamentDto>.Ok(new TournamentDto(tournament.Id, tournament.Name, tournament.Season,
            tournament.StartDate, tournament.EndDate, tournament.Status.ToString(), tournament.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<ApiResponse<TournamentDto>> Update(int id, TournamentUpdateDto dto)
    {
        var t = await _db.Tournaments.FindAsync(id) ?? throw new KeyNotFoundException("Tournament not found");
        t.Name = dto.Name;
        t.Season = dto.Season;
        t.StartDate = dto.StartDate;
        t.EndDate = dto.EndDate;
        t.Status = Enum.Parse<TournamentStatus>(dto.Status, true);
        await _db.SaveChangesAsync();
        return ApiResponse<TournamentDto>.Ok(new TournamentDto(t.Id, t.Name, t.Season, t.StartDate, t.EndDate, t.Status.ToString(), t.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<ApiResponse<string>> Delete(int id)
    {
        var t = await _db.Tournaments.FindAsync(id) ?? throw new KeyNotFoundException("Tournament not found");
        _db.Tournaments.Remove(t);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }

    // --- Tournament Teams ---
    [HttpGet("{id}/teams")]
    public async Task<ApiResponse<List<TournamentTeamDto>>> GetTeams(int id)
    {
        var list = await _db.TournamentTeams
            .Where(tt => tt.TournamentId == id)
            .Include(tt => tt.Team)
            .Select(tt => new TournamentTeamDto(tt.Id, tt.TeamId, tt.Team.Name, tt.RegisteredAt))
            .ToListAsync();
        return ApiResponse<List<TournamentTeamDto>>.Ok(list);
    }

    [HttpPost("{id}/teams")]
    public async Task<ApiResponse<TournamentTeamDto>> AddTeam(int id, AddTeamDto dto)
    {
        _ = await _db.Tournaments.FindAsync(id) ?? throw new KeyNotFoundException("Tournament not found");
        var team = await _db.Teams.FindAsync(dto.TeamId) ?? throw new KeyNotFoundException("Team not found");

        var tt = new TournamentTeam { TournamentId = id, TeamId = dto.TeamId };
        _db.TournamentTeams.Add(tt);
        await _db.SaveChangesAsync();
        return ApiResponse<TournamentTeamDto>.Ok(new TournamentTeamDto(tt.Id, tt.TeamId, team.Name, tt.RegisteredAt));
    }

    [HttpDelete("{id}/teams/{teamId}")]
    public async Task<ApiResponse<string>> RemoveTeam(int id, int teamId)
    {
        var tt = await _db.TournamentTeams.FirstOrDefaultAsync(x => x.TournamentId == id && x.TeamId == teamId)
            ?? throw new KeyNotFoundException("Team not in tournament");
        _db.TournamentTeams.Remove(tt);
        await _db.SaveChangesAsync();
        return ApiResponse<string>.Ok("Deleted");
    }

    // --- 3.1 Leaderboard ---
    [HttpGet("{id}/leaderboard")]
    public async Task<ApiResponse<List<LeaderboardEntryDto>>> GetLeaderboard(int id)
    {
        var list = await (
            from pgs in _db.PlayerGameStats
            join g in _db.Games on pgs.GameId equals g.Id
            join p in _db.Players on pgs.PlayerId equals p.Id
            join t in _db.Teams on pgs.TeamId equals t.Id
            where g.TournamentId == id && g.Status == GameStatus.Finished
            group pgs by new { pgs.PlayerId, PlayerName = p.Name, TeamName = t.Name } into grp
            orderby grp.Sum(x => x.TotalPoints) descending
            select new LeaderboardEntryDto(
                grp.Key.PlayerId, grp.Key.PlayerName, grp.Key.TeamName, grp.Sum(x => x.TotalPoints))
        ).ToListAsync();
        return ApiResponse<List<LeaderboardEntryDto>>.Ok(list);
    }

    // --- 3.2 Team Tournament Stats ---
    [HttpGet("{id}/teams/{teamId}/stats")]
    public async Task<ApiResponse<List<TeamTournamentStatsDto>>> GetTeamStats(int id, int teamId)
    {
        var list = await (
            from pgs in _db.PlayerGameStats
            join g in _db.Games on pgs.GameId equals g.Id
            join p in _db.Players on pgs.PlayerId equals p.Id
            join tm in _db.TeamMembers
                on new { pgs.PlayerId, TeamId = teamId } equals new { tm.PlayerId, tm.TeamId }
                into tmGroup
            from tm in tmGroup.DefaultIfEmpty()
            where g.TournamentId == id && pgs.TeamId == teamId && g.Status == GameStatus.Finished
            group pgs by new { pgs.PlayerId, PlayerName = p.Name, JerseyNumber = (int?)tm.JerseyNumber } into grp
            orderby grp.Sum(x => x.TotalPoints) descending
            select new TeamTournamentStatsDto(
                grp.Key.PlayerId, grp.Key.PlayerName, grp.Key.JerseyNumber,
                grp.Select(x => x.GameId).Distinct().Count(),
                grp.Sum(x => x.TwoPointAttempts), grp.Sum(x => x.TwoPointPoints),
                grp.Sum(x => x.ThreePointAttempts), grp.Sum(x => x.ThreePointPoints),
                grp.Sum(x => x.FreeThrowAttempts), grp.Sum(x => x.FreeThrowPoints),
                grp.Sum(x => x.TotalPoints))
        ).ToListAsync();
        return ApiResponse<List<TeamTournamentStatsDto>>.Ok(list);
    }
}
