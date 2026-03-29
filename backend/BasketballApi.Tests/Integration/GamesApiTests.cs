using System.Net;
using System.Net.Http.Json;
using BasketballApi.DTOs;

namespace BasketballApi.Tests.Integration;

public class GamesApiTests : IClassFixture<CustomWebAppFactory>
{
    private readonly HttpClient _client;

    public GamesApiTests(CustomWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Create_Game_Same_Team_Returns_BadRequest()
    {
        var team = await CreateTeam("SameTeam_" + Guid.NewGuid());
        var tournament = await CreateTournament();

        var gameResp = await _client.PostAsJsonAsync("/api/games", new
        {
            tournamentId = tournament.Id,
            homeTeamId = team.Id,
            awayTeamId = team.Id,
            scheduledAt = DateTime.UtcNow.AddDays(1)
        });

        Assert.Equal(HttpStatusCode.BadRequest, gameResp.StatusCode);
    }

    [Fact]
    public async Task Create_And_Get_Game()
    {
        var t1 = await CreateTeam("Home_" + Guid.NewGuid());
        var t2 = await CreateTeam("Away_" + Guid.NewGuid());
        var tour = await CreateTournament();

        var createResp = await _client.PostAsJsonAsync("/api/games", new
        {
            tournamentId = tour.Id, homeTeamId = t1.Id, awayTeamId = t2.Id,
            scheduledAt = DateTime.UtcNow.AddDays(1), location = "Test Arena"
        });
        createResp.EnsureSuccessStatusCode();
        var created = await createResp.Content.ReadFromJsonAsync<ApiResponse<GameDto>>();

        Assert.NotNull(created?.Data);
        Assert.Equal(t1.Name, created.Data.HomeTeamName);
        Assert.Equal(t2.Name, created.Data.AwayTeamName);
        Assert.Equal("Upcoming", created.Data.Status);

        // Get by ID
        var getResp = await _client.GetAsync($"/api/games/{created.Data.Id}");
        getResp.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Get_Games_By_TournamentId()
    {
        var t1 = await CreateTeam("FilterH_" + Guid.NewGuid());
        var t2 = await CreateTeam("FilterA_" + Guid.NewGuid());
        var tour = await CreateTournament();

        await _client.PostAsJsonAsync("/api/games", new
        {
            tournamentId = tour.Id, homeTeamId = t1.Id, awayTeamId = t2.Id,
            scheduledAt = DateTime.UtcNow.AddDays(2)
        });

        var resp = await _client.GetAsync($"/api/games?tournamentId={tour.Id}");
        resp.EnsureSuccessStatusCode();

        var result = await resp.Content.ReadFromJsonAsync<ApiResponse<List<GameDto>>>();
        Assert.NotNull(result?.Data);
        Assert.True(result.Data.Count >= 1);
        Assert.All(result.Data, g => Assert.Equal(tour.Id, g.TournamentId));
    }

    private async Task<TeamDto> CreateTeam(string name)
    {
        var resp = await _client.PostAsJsonAsync("/api/teams", new { name });
        resp.EnsureSuccessStatusCode();
        var result = await resp.Content.ReadFromJsonAsync<ApiResponse<TeamDto>>();
        return result!.Data!;
    }

    private async Task<TournamentDto> CreateTournament()
    {
        var resp = await _client.PostAsJsonAsync("/api/tournaments",
            new { name = "Tour_" + Guid.NewGuid(), season = "2026", status = "Upcoming" });
        resp.EnsureSuccessStatusCode();
        var result = await resp.Content.ReadFromJsonAsync<ApiResponse<TournamentDto>>();
        return result!.Data!;
    }
}
