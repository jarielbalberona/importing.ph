# 🔐 Clerk Auth Flow Cheat Sheet

## Get current user
```ts
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
```

## Check role from metadata
```ts
const role = user?.publicMetadata?.role;
```

## Protect page routes
```ts
import { auth } from "@clerk/nextjs/server";

export async function loader() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
}
```

## Use token in API call
```ts
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();
const token = await getToken();
fetch("/api/shipments", { headers: { Authorization: `Bearer ${token}` } });
```