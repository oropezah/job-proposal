/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita que Google indexe las páginas con los datos privados de tus clientes
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
  // Desactiva el bloqueo de compilación por errores estrictos de TypeScript y ESLint en Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;