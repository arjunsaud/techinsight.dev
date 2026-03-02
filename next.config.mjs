/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
