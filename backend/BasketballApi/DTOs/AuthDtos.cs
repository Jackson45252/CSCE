namespace BasketballApi.DTOs;

public record LoginRequestDto(string Username, string Password);
public record LoginResponseDto(string Token, DateTime ExpiresAt);
public record AdminDto(int Id, string Username, DateTime CreatedAt);
public record AdminCreateDto(string Username, string Password);
public record AdminUpdateDto(string? Password);
