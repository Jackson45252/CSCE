using System.Net;
using System.Net.Http.Json;
using BasketballApi.DTOs;

namespace BasketballApi.Tests.Integration;

public class PlayersApiTests : IClassFixture<CustomWebAppFactory>
{
    private readonly HttpClient _client;

    public PlayersApiTests(CustomWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_Returns_Success()
    {
        var response = await _client.GetAsync("/api/players");
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<PlayerDto>>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
    }

    [Fact]
    public async Task Create_And_Get_Player()
    {
        // Create
        var createResponse = await _client.PostAsJsonAsync("/api/players", new { name = "Test Player" });
        createResponse.EnsureSuccessStatusCode();

        var created = await createResponse.Content.ReadFromJsonAsync<ApiResponse<PlayerDto>>();
        Assert.NotNull(created?.Data);
        Assert.Equal("Test Player", created.Data.Name);

        // Get by ID
        var getResponse = await _client.GetAsync($"/api/players/{created.Data.Id}");
        getResponse.EnsureSuccessStatusCode();

        var fetched = await getResponse.Content.ReadFromJsonAsync<ApiResponse<PlayerDto>>();
        Assert.Equal(created.Data.Id, fetched?.Data?.Id);
    }

    [Fact]
    public async Task Update_Player()
    {
        // Create first
        var createResp = await _client.PostAsJsonAsync("/api/players", new { name = "Original" });
        var created = await createResp.Content.ReadFromJsonAsync<ApiResponse<PlayerDto>>();

        // Update
        var updateResp = await _client.PutAsJsonAsync($"/api/players/{created!.Data!.Id}", new { name = "Updated" });
        updateResp.EnsureSuccessStatusCode();

        var updated = await updateResp.Content.ReadFromJsonAsync<ApiResponse<PlayerDto>>();
        Assert.Equal("Updated", updated?.Data?.Name);
    }

    [Fact]
    public async Task Delete_Player()
    {
        var createResp = await _client.PostAsJsonAsync("/api/players", new { name = "ToDelete" });
        var created = await createResp.Content.ReadFromJsonAsync<ApiResponse<PlayerDto>>();

        var deleteResp = await _client.DeleteAsync($"/api/players/{created!.Data!.Id}");
        deleteResp.EnsureSuccessStatusCode();

        var getResp = await _client.GetAsync($"/api/players/{created.Data.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    [Fact]
    public async Task GetNotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/players/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
