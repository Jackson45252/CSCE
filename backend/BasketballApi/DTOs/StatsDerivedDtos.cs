namespace BasketballApi.DTOs;

public record LeaderboardEntryDto(int PlayerId, string PlayerName, string TeamName, int TournamentTotalPoints);

public record TeamTournamentStatsDto(int PlayerId, string PlayerName, int? JerseyNumber, int GamesPlayed,
    int TotalTwoPointAttempts, int TotalTwoPointPoints,
    int TotalThreePointAttempts, int TotalThreePointPoints,
    int TotalFreeThrowAttempts, int TotalFreeThrowPoints,
    int TournamentTotalPoints);

public record BoxScoreEntryDto(int PlayerId, string PlayerName, int TeamId, string TeamName, int? JerseyNumber,
    int TwoPointAttempts, int TwoPointPoints,
    int ThreePointAttempts, int ThreePointPoints,
    int FreeThrowAttempts, int FreeThrowPoints,
    int TotalPoints);
