import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        // Enhanced personality colors
        "personality-funny": {
          50: "hsl(48, 100%, 96%)",
          100: "hsl(48, 96%, 89%)",
          200: "hsl(48, 97%, 77%)",
          300: "hsl(46, 97%, 65%)",
          400: "hsl(43, 96%, 56%)",
          500: "hsl(38, 92%, 50%)",
          600: "hsl(32, 95%, 44%)",
          700: "hsl(26, 90%, 37%)",
          800: "hsl(23, 83%, 31%)",
          900: "hsl(22, 78%, 26%)",
        },
        "personality-wise": {
          50: "hsl(214, 100%, 97%)",
          100: "hsl(214, 95%, 93%)",
          200: "hsl(213, 97%, 87%)",
          300: "hsl(212, 96%, 78%)",
          400: "hsl(213, 94%, 68%)",
          500: "hsl(217, 91%, 60%)",
          600: "hsl(221, 83%, 53%)",
          700: "hsl(224, 76%, 48%)",
          800: "hsl(226, 71%, 40%)",
          900: "hsl(224, 64%, 33%)",
        },
        "personality-savage": {
          50: "hsl(0, 86%, 97%)",
          100: "hsl(0, 93%, 94%)",
          200: "hsl(0, 96%, 89%)",
          300: "hsl(0, 94%, 82%)",
          400: "hsl(0, 91%, 71%)",
          500: "hsl(0, 84%, 60%)",
          600: "hsl(0, 72%, 51%)",
          700: "hsl(0, 74%, 42%)",
          800: "hsl(0, 70%, 35%)",
          900: "hsl(0, 63%, 31%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) translateX(0px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) translateX(100px)', opacity: '0' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'particle': 'particle 20s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
