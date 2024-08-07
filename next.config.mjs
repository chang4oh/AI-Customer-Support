/** @type {import('next').NextConfig} */
const nextConfig = {
    env:{
        openaitoken: process.env.OPENAI_API_KEY
    }
};

export default nextConfig;
