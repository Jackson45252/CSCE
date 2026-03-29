namespace BasketballApi.DTOs;

public record GameCreateDto(int TournamentId, int HomeTeamId, int AwayTeamId, DateTime ScheduledAt, string? Location);
public record GameUpdateDto(DateTime ScheduledAt, string? Location, string Status, int? HomeScore, int? AwayScore);
public record GameDto(int Id, int TournamentId, int HomeTeamId, string HomeTeamName, int AwayTeamId, string AwayTeamName,
    DateTime ScheduledAt, string? Location, string Status, int? HomeScore, int? AwayScore, DateTime CreatedAt);
