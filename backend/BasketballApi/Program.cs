using Microsoft.EntityFrameworkCore;
using BasketballApi.Data;
using BasketballApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// CORS — allow frontend dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-migrate & seed in development (skip if not relational / testing)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.ProviderName != "Microsoft.EntityFrameworkCore.Sqlite"
        && db.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
    {
        db.Database.Migrate();
        DbSeeder.Seed(db);
    }

    app.MapOpenApi();
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();

// Make Program accessible to test project
public partial class Program { }
