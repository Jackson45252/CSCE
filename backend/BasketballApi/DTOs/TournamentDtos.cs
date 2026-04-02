namespace BasketballApi.DTOs;

public record TournamentCategoryCreateDto(string Name, string? Description);
public record TournamentCategoryUpdateDto(string Name, string? Description);
public record TournamentCategoryDto(int Id, string Name, string? Description, DateTime CreatedAt);

public record TournamentCreateDto(string Name, string Season, DateOnly? StartDate, DateOnly? EndDate, string Status = "Upcoming", int? CategoryId = null);
public record TournamentUpdateDto(string Name, string Season, DateOnly? StartDate, DateOnly? EndDate, string Status, int? CategoryId = null);
public record TournamentDto(int Id, string Name, string Season, DateOnly? StartDate, DateOnly? EndDate, string Status, DateTime CreatedAt, int? CategoryId = null, string? CategoryName = null);
public record TournamentTeamDto(int Id, int TeamId, string TeamName, DateTime RegisteredAt);
public record AddTeamDto(int TeamId);
public record TournamentRosterDto(int Id, int PlayerId, string PlayerName, int? JerseyNumber, DateTime AddedAt);
public record TournamentRosterAddDto(int PlayerId, int? JerseyNumber);
public record TournamentStandingDto(int TeamId, string TeamName, int Wins, int Losses, int PointsFor, int PointsAgainst);
