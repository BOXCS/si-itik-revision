/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["assets.aceternity.com"],
    },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.html$/,
            use: 'html-loader', // Menambahkan loader untuk menangani file .html
        });
        return config;
    },
    // Menambahkan opsi trailingSlash dan reactStrictMode
    trailingSlash: true, // Menambahkan slash di akhir URL
    reactStrictMode: true, // Mengaktifkan Strict Mode di React
};

export default nextConfig;
