namespace BasketballApi.DTOs;

public record TeamCreateDto(string Name, string? LogoUrl);
public record TeamUpdateDto(string Name, string? LogoUrl);
public record TeamDto(int Id, string Name, string? LogoUrl, DateTime CreatedAt);
public record TeamMemberCreateDto(int PlayerId, int? JerseyNumber);
public record TeamMemberDto(int Id, int PlayerId, string PlayerName, int? JerseyNumber, DateTime JoinedAt);
