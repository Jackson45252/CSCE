using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BasketballApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTournamentRoster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TournamentRosters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TournamentTeamId = table.Column<int>(type: "integer", nullable: false),
                    PlayerId = table.Column<int>(type: "integer", nullable: false),
                    JerseyNumber = table.Column<int>(type: "integer", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentRosters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TournamentRosters_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TournamentRosters_TournamentTeams_TournamentTeamId",
                        column: x => x.TournamentTeamId,
                        principalTable: "TournamentTeams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRosters_PlayerId",
                table: "TournamentRosters",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRosters_TournamentTeamId_JerseyNumber",
                table: "TournamentRosters",
                columns: new[] { "TournamentTeamId", "JerseyNumber" },
                unique: true,
                filter: "\"JerseyNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRosters_TournamentTeamId_PlayerId",
                table: "TournamentRosters",
                columns: new[] { "TournamentTeamId", "PlayerId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TournamentRosters");
        }
    }
}
