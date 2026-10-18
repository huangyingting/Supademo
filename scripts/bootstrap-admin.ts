import 'dotenv/config';
import { createBootstrapAdmin } from '../src/lib/account-admission/bootstrap';
import { AccountAdmissionError } from '../src/lib/account-admission/errors';

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return undefined;
}

async function main() {
  const email =
    readArg('--email') ||
    process.env.BOOTSTRAP_ADMIN_EMAIL ||
    'admin@supademo.local';
  const password =
    readArg('--password') ||
    process.env.BOOTSTRAP_ADMIN_PASSWORD ||
    'ChangeMeStrongPassword123!';
  const name =
    readArg('--name') ||
    process.env.BOOTSTRAP_ADMIN_NAME ||
    'Joshuah Powlowski';

  try {
    const admin = await createBootstrapAdmin({ email, password, name });
    console.log(
      JSON.stringify(
        {
          ok: true,
          message: 'Bootstrap administrator created via CLI.',
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            status: admin.status,
          },
        },
        null,
        2
      )
    );
    process.exit(0);
  } catch (err) {
    if (err instanceof AccountAdmissionError) {
      console.error(
        JSON.stringify({
          ok: false,
          code: err.code,
          status: err.status,
          message: err.message,
        })
      );
      process.exit(1);
    }
    console.error(err);
    process.exit(1);
  }
}

main();
