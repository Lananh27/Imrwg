import bcrypt from "bcrypt";

async function main() {
  const password = "273702";
  const hash = await bcrypt.hash(password, 10);

  console.log(hash);
}

main();