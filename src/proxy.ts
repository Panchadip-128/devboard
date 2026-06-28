import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/incidents/:path*",
    "/deployments/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/burnout/:path*",
    "/platform-diagnostics/:path*",
  ],
};
