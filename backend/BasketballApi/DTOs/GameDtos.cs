namespace BasketballApi.DTOs;

public record GameCreateDto(int TournamentId, int HomeTeamId, int AwayTeamId, DateTime ScheduledAt, string? Location);
public record GameUpdateDto(
    DateTime ScheduledAt, string? Location, string Status,
    int? HomeScore, int? AwayScore,
    int? HomeQ1, int? HomeQ2, int? HomeQ3, int? HomeQ4, int? HomeOt1, int? HomeOt2,
    int? AwayQ1, int? AwayQ2, int? AwayQ3, int? AwayQ4, int? AwayOt1, int? AwayOt2);
public record GameDto(
    int Id, int TournamentId, int HomeTeamId, string HomeTeamName, int AwayTeamId, string AwayTeamName,
    DateTime ScheduledAt, string? Location, string Status,
    int? HomeScore, int? AwayScore,
    int? HomeQ1, int? HomeQ2, int? HomeQ3, int? HomeQ4, int? HomeOt1, int? HomeOt2,
    int? AwayQ1, int? AwayQ2, int? AwayQ3, int? AwayQ4, int? AwayOt1, int? AwayOt2,
    DateTime CreatedAt);
