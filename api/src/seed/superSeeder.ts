import seedUsers from "@/seed/seeders/seedUser";

async function runSeeders() {
	try {
		console.log("Seeding started...\n\n");

		const isRDS = process.env.DATABASE_URL?.includes("rds.amazonaws.com");

		await seedUsers();

		if (!isRDS) {
      console.log("Seeding local data only");

      console.log("Seeding local data only completed");
		} else {
			console.log("Skipping users and tasks seeding (running on RDS)...");
		}
		console.log("\nSeeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error during seeding:", error);
		process.exit(1);
	}
}

runSeeders();
