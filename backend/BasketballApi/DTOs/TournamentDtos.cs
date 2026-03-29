namespace BasketballApi.DTOs;

public record TournamentCreateDto(string Name, string Season, DateOnly? StartDate, DateOnly? EndDate, string Status = "Upcoming");
public record TournamentUpdateDto(string Name, string Season, DateOnly? StartDate, DateOnly? EndDate, string Status);
public record TournamentDto(int Id, string Name, string Season, DateOnly? StartDate, DateOnly? EndDate, string Status, DateTime CreatedAt);
public record TournamentTeamDto(int Id, int TeamId, string TeamName, DateTime RegisteredAt);
public record AddTeamDto(int TeamId);
