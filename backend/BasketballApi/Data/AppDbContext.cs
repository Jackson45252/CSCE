using Microsoft.EntityFrameworkCore;
using BasketballApi.Models;

namespace BasketballApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Player> Players => Set<Player>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<TournamentTeam> TournamentTeams => Set<TournamentTeam>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<PlayerGameStats> PlayerGameStats => Set<PlayerGameStats>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<Role> Roles => Set<Role>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Admin ---
        modelBuilder.Entity<Admin>(e =>
        {
            e.Property(a => a.Username).HasMaxLength(50).IsRequired();
            e.HasIndex(a => a.Username).IsUnique();
            e.Property(a => a.PasswordHash).HasMaxLength(200).IsRequired();
        });

        // --- Role ---
        modelBuilder.Entity<Role>(e =>
        {
            e.Property(r => r.Name).HasMaxLength(50).IsRequired();
            e.HasIndex(r => r.Name).IsUnique();
            e.Property(r => r.Description).HasMaxLength(200);
        });

        // --- Player ---
        modelBuilder.Entity<Player>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(50).IsRequired();
        });

        // --- Team ---
        modelBuilder.Entity<Team>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(100).IsRequired();
            e.HasIndex(t => t.Name).IsUnique();
            e.Property(t => t.LogoUrl).HasMaxLength(255);
        });

        // --- TeamMember ---
        modelBuilder.Entity<TeamMember>(e =>
        {
            e.HasIndex(tm => new { tm.TeamId, tm.PlayerId }).IsUnique();
            e.HasIndex(tm => new { tm.TeamId, tm.JerseyNumber }).IsUnique().HasFilter("\"JerseyNumber\" IS NOT NULL");
            e.HasOne(tm => tm.Team).WithMany(t => t.TeamMembers).HasForeignKey(tm => tm.TeamId);
            e.HasOne(tm => tm.Player).WithMany(p => p.TeamMembers).HasForeignKey(tm => tm.PlayerId);
        });

        // --- Tournament ---
        modelBuilder.Entity<Tournament>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(100).IsRequired();
            e.Property(t => t.Season).HasMaxLength(20).IsRequired();
            e.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
        });

        // --- TournamentTeam ---
        modelBuilder.Entity<TournamentTeam>(e =>
        {
            e.HasIndex(tt => new { tt.TournamentId, tt.TeamId }).IsUnique();
            e.HasOne(tt => tt.Tournament).WithMany(t => t.TournamentTeams).HasForeignKey(tt => tt.TournamentId);
            e.HasOne(tt => tt.Team).WithMany(t => t.TournamentTeams).HasForeignKey(tt => tt.TeamId);
        });

        // --- Game ---
        modelBuilder.Entity<Game>(e =>
        {
            e.Property(g => g.Location).HasMaxLength(100);
            e.Property(g => g.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(g => g.Tournament).WithMany(t => t.Games).HasForeignKey(g => g.TournamentId);
            e.HasOne(g => g.HomeTeam).WithMany(t => t.HomeGames).HasForeignKey(g => g.HomeTeamId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(g => g.AwayTeam).WithMany(t => t.AwayGames).HasForeignKey(g => g.AwayTeamId).OnDelete(DeleteBehavior.Restrict);
        });

        // --- PlayerGameStats ---
        modelBuilder.Entity<PlayerGameStats>(e =>
        {
            e.HasIndex(pgs => new { pgs.GameId, pgs.PlayerId }).IsUnique();
            e.HasOne(pgs => pgs.Game).WithMany(g => g.PlayerGameStats).HasForeignKey(pgs => pgs.GameId);
            e.HasOne(pgs => pgs.Player).WithMany(p => p.GameStats).HasForeignKey(pgs => pgs.PlayerId);
            e.HasOne(pgs => pgs.Team).WithMany().HasForeignKey(pgs => pgs.TeamId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
