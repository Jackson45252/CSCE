using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BasketballApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminToRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Admins");

            migrationBuilder.AddColumn<string[]>(
                name: "Roles",
                table: "Admins",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Roles",
                table: "Admins");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Admins",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
