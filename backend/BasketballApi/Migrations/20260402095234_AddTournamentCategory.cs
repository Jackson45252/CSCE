using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BasketballApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTournamentCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Season",
                table: "Tournaments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Tournaments",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TournamentCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentCategories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_CategoryId",
                table: "Tournaments",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentCategories_Name",
                table: "TournamentCategories",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Tournaments_TournamentCategories_CategoryId",
                table: "Tournaments",
                column: "CategoryId",
                principalTable: "TournamentCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tournaments_TournamentCategories_CategoryId",
                table: "Tournaments");

            migrationBuilder.DropTable(
                name: "TournamentCategories");

            migrationBuilder.DropIndex(
                name: "IX_Tournaments_CategoryId",
                table: "Tournaments");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Tournaments");

            migrationBuilder.AlterColumn<string>(
                name: "Season",
                table: "Tournaments",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
