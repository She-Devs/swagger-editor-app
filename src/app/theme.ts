import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "gray",
  colors: {
    gray: [
      "#f8f9fa",
      "#f1f3f5",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#868e96",
      "#495057",
      "#343a40",
      "#212529",
    ],
  },

  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  defaultRadius: "md",

  radius: {
    xs: "4px",
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "28px",
    "2xl": "32px",
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.5",
    lg: "1.6",
  },

  fontSizes: {
    xs: "12px",
    sm: "13px",
    md: "14px",
    lg: "15px",
    xl: "20px",
    "2xl": "28px",
    "3xl": "36px",
    hero: "56px",
    display: "120px",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "40px",
    "4xl": "48px",
    "5xl": "60px",
    "6xl": "80px",
    huge: "120px",
  },
});
