using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.DTOs;
using BasketballApi.Models;

namespace BasketballApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _db;
    public RolesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ApiResponse<List<RoleDto>>> GetAll()
    {
        var list = await _db.Roles.OrderBy(r => r.Id)
            .Select(r => new RoleDto(r.Id, r.Name, r.Description, r.CreatedAt))
            .ToListAsync();
        return ApiResponse<List<RoleDto>>.Ok(list);
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<RoleDto>>> Create(RoleCreateDto dto)
    {
        if (await _db.Roles.AnyAsync(r => r.Name == dto.Name))
            return BadRequest(ApiResponse<RoleDto>.Fail("Role name already exists"));

        var role = new Role { Name = dto.Name, Description = dto.Description };
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<RoleDto>.Ok(new RoleDto(role.Id, role.Name, role.Description, role.CreatedAt)));
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> Update(int id, RoleUpdateDto dto)
    {
        var role = await _db.Roles.FindAsync(id);
        if (role is null)
            return NotFound(ApiResponse<RoleDto>.Fail("Role not found"));

        if (await _db.Roles.AnyAsync(r => r.Name == dto.Name && r.Id != id))
            return BadRequest(ApiResponse<RoleDto>.Fail("Role name already exists"));

        role.Name = dto.Name;
        role.Description = dto.Description;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<RoleDto>.Ok(new RoleDto(role.Id, role.Name, role.Description, role.CreatedAt)));
    }

    [Authorize(Roles = "SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
    {
        var role = await _db.Roles.FindAsync(id);
        if (role is null)
            return NotFound(ApiResponse<string>.Fail("Role not found"));

        // Check if any admin is using this role
        var inUse = await _db.Admins.AnyAsync(a => a.Roles.Contains(role.Name));
        if (inUse)
            return BadRequest(ApiResponse<string>.Fail("Cannot delete a role that is assigned to admins"));

        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<string>.Ok("Deleted"));
    }
}
