using BasketballApi.Models;

namespace BasketballApi.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        // Seed admin account
        if (!db.Admins.Any())
        {
            db.Admins.Add(new Admin
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
            });
            db.SaveChanges();
        }

        if (db.Players.Any()) return;

        // Players
        var players = new[]
        {
            new Player { Name = "陳大明" },
            new Player { Name = "林小華" },
            new Player { Name = "王建志" },
            new Player { Name = "張志豪" },
            new Player { Name = "李柏翰" },
            new Player { Name = "黃冠霖" },
            new Player { Name = "吳宗憲" },
            new Player { Name = "劉家瑋" },
            new Player { Name = "蔡承恩" },
            new Player { Name = "楊俊傑" },
        };
        db.Players.AddRange(players);
        db.SaveChanges();

        // Teams
        var teamA = new Team { Name = "雷霆隊" };
        var teamB = new Team { Name = "烈焰隊" };
        db.Teams.AddRange(teamA, teamB);
        db.SaveChanges();

        // TeamMembers
        for (int i = 0; i < 5; i++)
        {
            db.TeamMembers.Add(new TeamMember { TeamId = teamA.Id, PlayerId = players[i].Id, JerseyNumber = (i + 1) * 10 });
            db.TeamMembers.Add(new TeamMember { TeamId = teamB.Id, PlayerId = players[i + 5].Id, JerseyNumber = (i + 1) * 10 });
        }
        db.SaveChanges();

        // Tournament
        var tournament = new Tournament
        {
            Name = "2026 熱血盃賽",
            Season = "2026",
            StartDate = new DateOnly(2026, 4, 1),
            EndDate = new DateOnly(2026, 5, 31),
            Status = TournamentStatus.Ongoing
        };
        db.Tournaments.Add(tournament);
        db.SaveChanges();

        // TournamentTeams
        db.TournamentTeams.AddRange(
            new TournamentTeam { TournamentId = tournament.Id, TeamId = teamA.Id },
            new TournamentTeam { TournamentId = tournament.Id, TeamId = teamB.Id }
        );
        db.SaveChanges();

        // Game
        var game = new Game
        {
            TournamentId = tournament.Id,
            HomeTeamId = teamA.Id,
            AwayTeamId = teamB.Id,
            ScheduledAt = new DateTime(2026, 4, 5, 14, 0, 0, DateTimeKind.Utc),
            Location = "中正體育館",
            Status = GameStatus.Finished,
            HomeScore = 78,
            AwayScore = 72
        };
        db.Games.Add(game);
        db.SaveChanges();

        // PlayerGameStats — home team
        var random = new Random(42);
        for (int i = 0; i < 5; i++)
        {
            int twoPts = random.Next(2, 8) * 2;
            int threePts = random.Next(0, 4) * 3;
            int ftPts = random.Next(0, 5);
            db.PlayerGameStats.Add(new PlayerGameStats
            {
                GameId = game.Id,
                PlayerId = players[i].Id,
                TeamId = teamA.Id,
                TwoPointAttempts = random.Next(5, 15),
                TwoPointPoints = twoPts,
                ThreePointAttempts = random.Next(2, 8),
                ThreePointPoints = threePts,
                FreeThrowAttempts = random.Next(1, 6),
                FreeThrowPoints = ftPts,
                TotalPoints = twoPts + threePts + ftPts
            });
        }

        // PlayerGameStats — away team
        for (int i = 5; i < 10; i++)
        {
            int twoPts = random.Next(2, 8) * 2;
            int threePts = random.Next(0, 4) * 3;
            int ftPts = random.Next(0, 5);
            db.PlayerGameStats.Add(new PlayerGameStats
            {
                GameId = game.Id,
                PlayerId = players[i].Id,
                TeamId = teamB.Id,
                TwoPointAttempts = random.Next(5, 15),
                TwoPointPoints = twoPts,
                ThreePointAttempts = random.Next(2, 8),
                ThreePointPoints = threePts,
                FreeThrowAttempts = random.Next(1, 6),
                FreeThrowPoints = ftPts,
                TotalPoints = twoPts + threePts + ftPts
            });
        }
        db.SaveChanges();
    }
}
