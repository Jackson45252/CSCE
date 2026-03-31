namespace BasketballApi.DTOs;

public record LoginRequestDto(string Username, string Password);
public record LoginResponseDto(string Token, DateTime ExpiresAt, string[] Roles);
public record AdminDto(int Id, string Username, string[] Roles, DateTime CreatedAt);
public record AdminCreateDto(string Username, string Password, string[] Roles);
public record AdminUpdateDto(string? Password, string[]? Roles);
