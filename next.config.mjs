/** @type {import('next').NextConfig} */
const nextConfig = {
  // Las páginas contienen el texto del job de un cliente: nunca deben indexarse en Google.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
