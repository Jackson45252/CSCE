namespace BasketballApi.DTOs;

public record PlayerCreateDto(string Name);
public record PlayerUpdateDto(string Name);
public record PlayerDto(int Id, string Name, DateTime CreatedAt);
