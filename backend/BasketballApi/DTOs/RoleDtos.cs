namespace BasketballApi.DTOs;

public record RoleDto(int Id, string Name, string Description, DateTime CreatedAt);
public record RoleCreateDto(string Name, string Description);
public record RoleUpdateDto(string Name, string Description);
