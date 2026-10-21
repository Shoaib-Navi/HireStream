// Usage: node src/scripts/create-admin.js "Full Name" admin@example.com "Password123"
// Creates an admin account, or promotes an existing user to admin and resets their password.
import { connectDB, disconnectDB } from "../config/db.js";
import { ROLES, USER_STATUS } from "../constants/index.js";
import { hashPassword } from "../modules/auth/auth.service.js";
import { User } from "../modules/users/user.model.js";

const [fullName, rawEmail, password] = process.argv.slice(2);

if (!fullName || !rawEmail || !password) {
  console.error('Usage: node src/scripts/create-admin.js "Full Name" admin@example.com "Password123"');
  process.exit(1);
}
if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
  console.error("Password must be at least 8 characters and contain a letter and a number");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();

try {
  await connectDB();

  const existing = await User.findOne({ email });
  const update = {
    fullName,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    password: await hashPassword(password),
    emailVerifiedAt: existing?.emailVerifiedAt ?? new Date(),
  };

  if (existing) {
    // a new password invalidates the sessions of whoever used this account before
    await User.updateOne({ _id: existing._id }, { $set: update, $inc: { tokenVersion: 1 } });
    console.log(`Updated ${email} to an admin account`);
  } else {
    await User.create({ ...update, email });
    console.log(`Created admin account ${email}`);
  }

  await disconnectDB();
} catch (error) {
  console.error("Could not create the admin account:", error.message);
  await disconnectDB();
  process.exit(1);
}
