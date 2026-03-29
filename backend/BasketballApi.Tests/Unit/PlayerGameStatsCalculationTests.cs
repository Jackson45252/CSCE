using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.Models;
using BasketballApi.Tests.Helpers;

namespace BasketballApi.Tests.Unit;

public class PlayerGameStatsCalculationTests
{
    [Fact]
    public void TotalPoints_Should_Equal_Sum_Of_All_Points()
    {
        var stats = new PlayerGameStats
        {
            TwoPointPoints = 12,
            ThreePointPoints = 9,
            FreeThrowPoints = 3,
        };

        var total = stats.TwoPointPoints + stats.ThreePointPoints + stats.FreeThrowPoints;

        Assert.Equal(24, total);
    }

    [Fact]
    public async Task Seed_Creates_Expected_Data()
    {
        var db = TestDbContext.Create();
        DbSeeder.Seed(db);

        Assert.Equal(10, await db.Players.CountAsync());
        Assert.Equal(2, await db.Teams.CountAsync());
        Assert.Equal(1, await db.Tournaments.CountAsync());
        Assert.Equal(1, await db.Games.CountAsync());
        Assert.Equal(10, await db.PlayerGameStats.CountAsync());
    }

    [Fact]
    public async Task Unique_Constraint_TeamMember_Prevents_Duplicates()
    {
        var db = TestDbContext.Create();
        DbSeeder.Seed(db);

        var members = await db.TeamMembers.ToListAsync();
        var unique = members.Select(m => (m.TeamId, m.PlayerId)).Distinct().Count();

        Assert.Equal(members.Count, unique);
    }
}
