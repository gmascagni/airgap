/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B0F17",
        slateDeep: "#111827",
        cardSurface: "#1F2937",
        cardBorder: "#374151",
        tacticalCyan: "#06B6D4",
        zeroTrustEmerald: "#10B981",
        warningAmber: "#F59E0B",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Space Grotesk",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Cascadia Code",
          "Consolas",
          "monospace",
        ],
      },
      backgroundImage: {
        "tactical-grid":
          "linear-gradient(to right, rgba(55, 65, 81, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(55, 65, 81, 0.16) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
