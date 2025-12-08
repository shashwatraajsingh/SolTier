/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                patrick: ["var(--font-patrick)", "cursive"],
                inter: ["var(--font-inter)", "sans-serif"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            boxShadow: {
                'sketch': '4px 4px 0px 0px rgba(0,0,0,1)',
                'sketch-hover': '6px 6px 0px 0px rgba(0,0,0,1)',
                'sketch-active': '2px 2px 0px 0px rgba(0,0,0,1)',
            }
        },
    },
    plugins: [],
};
