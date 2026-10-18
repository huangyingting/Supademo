import { NextResponse } from 'next/server';
import {
  AccountAdmissionError,
  registerUserWithAdmission,
} from '@/lib/account-admission';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerUserWithAdmission({
      email: body.email,
      name: body.name,
      password: body.password,
      invitationToken: body.invitationToken || body.token || null,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AccountAdmissionError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to register user.' },
      { status: 500 }
    );
  }
}
