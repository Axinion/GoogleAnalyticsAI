'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-700">
            {user.firstName} {user.lastName}
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
