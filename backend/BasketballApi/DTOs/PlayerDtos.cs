namespace BasketballApi.DTOs;

public record PlayerCreateDto(string Name, string? Email, string? Remark);
public record PlayerUpdateDto(string Name, string? Email, string? Remark);
public record PlayerDto(int Id, string Name, string? Email, string? Remark, DateTime CreatedAt);
public record PlayerTeamDto(int TeamId, string TeamName, int? JerseyNumber, DateTime JoinedAt);
