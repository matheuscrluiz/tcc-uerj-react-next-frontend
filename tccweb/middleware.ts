import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/themes") ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/assets") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }
    const publicRoutes = ["/auth/login"];

    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!token && !isPublicRoute) {
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

