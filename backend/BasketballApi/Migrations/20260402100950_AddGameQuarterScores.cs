using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasketballApi.Migrations
{
    /// <inheritdoc />
    public partial class AddGameQuarterScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AwayOt1",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayOt2",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayQ1",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayQ2",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayQ3",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AwayQ4",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeOt1",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeOt2",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeQ1",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeQ2",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeQ3",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HomeQ4",
                table: "Games",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AwayOt1",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AwayOt2",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AwayQ1",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AwayQ2",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AwayQ3",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AwayQ4",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HomeOt1",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HomeOt2",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HomeQ1",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HomeQ2",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HomeQ3",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "HomeQ4",
                table: "Games");
        }
    }
}
