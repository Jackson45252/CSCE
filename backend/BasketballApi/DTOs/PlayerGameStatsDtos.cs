namespace BasketballApi.DTOs;

public record StatsCreateDto(int GameId, int PlayerId, int TeamId,
    int TwoPointAttempts, int TwoPointPoints,
    int ThreePointAttempts, int ThreePointPoints,
    int FreeThrowAttempts, int FreeThrowPoints);

public record StatsUpdateDto(
    int TwoPointAttempts, int TwoPointPoints,
    int ThreePointAttempts, int ThreePointPoints,
    int FreeThrowAttempts, int FreeThrowPoints);

public record StatsDto(int Id, int GameId, int PlayerId, string PlayerName, int TeamId, string TeamName,
    int TwoPointAttempts, int TwoPointPoints,
    int ThreePointAttempts, int ThreePointPoints,
    int FreeThrowAttempts, int FreeThrowPoints,
    int TotalPoints, DateTime CreatedAt);
