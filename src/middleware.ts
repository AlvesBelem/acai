import { auth } from "@/auth";
import { AppRole } from "@/lib/roles";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuth = !!req.auth;
  const role = req.auth?.user?.role as AppRole | undefined;
  const isAdmin = role === "ADMIN";
  const pathname = nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPlatformRoute = pathname.startsWith("/plataforma");

  if (isAdminRoute && !isAuth) {
    return Response.redirect(new URL("/", nextUrl));
  }
  if (isAdminRoute && !isAdmin) {
    return Response.redirect(new URL("/plataforma", nextUrl));
  }
  if (isPlatformRoute && !isAuth) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: ["/plataforma/:path*", "/admin/:path*"],
};
