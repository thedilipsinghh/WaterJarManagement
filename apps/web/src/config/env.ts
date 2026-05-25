export const env = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  BACKEND_LIVE_URL: process.env.NEXT_PUBLIC_BACKEND_LIVE_URL || "https://water-jar-management-api-topaz.vercel.app",
  NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV || "development",
  
  get API_URL() {
    // Next.js statically replaces process.env.NODE_ENV with "production" or "development" at build time.
    const isProd = process.env.NODE_ENV === "production" || this.NODE_ENV === "production";
    const baseUrl = isProd ? this.BACKEND_LIVE_URL : this.BACKEND_URL;
    return `${baseUrl}/api`;
  }
};
