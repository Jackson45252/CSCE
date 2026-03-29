using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;
using BasketballApi.Services;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _db;

    public AuthController(AuthService authService, AppDbContext db)
    {
        _authService = authService;
        _db = db;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login(LoginRequestDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result is null)
            return Unauthorized(ApiResponse<LoginResponseDto>.Fail("Invalid credentials"));
        return Ok(ApiResponse<LoginResponseDto>.Ok(result));
    }

    // --- Admin Account Management ---

    [Authorize]
    [HttpGet("accounts")]
    public async Task<ApiResponse<List<AdminDto>>> GetAccounts()
    {
        var list = await _db.Admins.OrderBy(a => a.Id)
            .Select(a => new AdminDto(a.Id, a.Username, a.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<AdminDto>>.Ok(list);
    }

    [Authorize]
    [HttpPost("accounts")]
    public async Task<ActionResult<ApiResponse<AdminDto>>> CreateAccount(AdminCreateDto dto)
    {
        if (await _db.Admins.AnyAsync(a => a.Username.ToLower() == dto.Username.ToLower()))
            return BadRequest(ApiResponse<AdminDto>.Fail("Username already exists"));

        var admin = new Admin
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        _db.Admins.Add(admin);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<AdminDto>.Ok(new AdminDto(admin.Id, admin.Username, admin.CreatedAt)));
    }

    [Authorize]
    [HttpPut("accounts/{id}")]
    public async Task<ActionResult<ApiResponse<AdminDto>>> UpdateAccount(int id, AdminUpdateDto dto)
    {
        var admin = await _db.Admins.FindAsync(id);
        if (admin is null)
            return NotFound(ApiResponse<AdminDto>.Fail("Admin not found"));

        if (!string.IsNullOrWhiteSpace(dto.Password))
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<AdminDto>.Ok(new AdminDto(admin.Id, admin.Username, admin.CreatedAt)));
    }

    [Authorize]
    [HttpDelete("accounts/{id}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteAccount(int id)
    {
        var admin = await _db.Admins.FindAsync(id);
        if (admin is null)
            return NotFound(ApiResponse<string>.Fail("Admin not found"));

        if (await _db.Admins.CountAsync() <= 1)
            return BadRequest(ApiResponse<string>.Fail("Cannot delete the last admin"));

        _db.Admins.Remove(admin);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Deleted"));
    }
}
