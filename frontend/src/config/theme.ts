import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB",
      dark: "#1D4ED8",
      light: "#DBEAFE",
    },
    secondary: {
      main: "#EBA832",
      dark: "#A86808",
      light: "#FFF3D6",
      contrastText: "#111827",
    },
    background: {
      default: "#F1F5F9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    success: {
      main: "#16885F",
      light: "#ECFDF5",
    },
    warning: {
      main: "#D97706",
      light: "#FFFBEB",
    },
    error: {
      main: "#B91C1C",
      light: "#FEF2F2",
    },
    info: {
      main: "#2563EB",
      light: "#EFF6FF",
    },
    grey: {
      100: "#F3F4F6",
      700: "#374151",
    },
    divider: "#E8EDF3",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: ["var(--font-inter)", "Inter", "Arial", "sans-serif"].join(","),
    fontSize: 14,
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 800,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E1 transparent",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(17, 24, 39, 0.07)",
          color: "#111827",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 38,
          boxShadow: "none",
          transitionProperty: "background-color, border-color, box-shadow, transform, opacity",
          transitionDuration: "160ms",
          transitionTimingFunction: "ease-out",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
            opacity: 0.92,
          },
          "&:active": {
            transform: "scale(0.97)",
          },
        },
        outlined: {
          borderColor: "rgba(17, 24, 39, 0.14)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow:
            "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
        },
        elevation2: {
          boxShadow:
            "0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
        },
        elevation3: {
          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.10), 0 4px 8px rgba(15, 23, 42, 0.05)",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          letterSpacing: 0,
        },
        subheader: {
          color: "#667085",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "box-shadow 160ms ease-out",
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563EB",
              borderWidth: 1.5,
            },
            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
          },
          "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(15, 23, 42, 0.28)",
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        slotProps: {
          backdrop: {
            sx: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(15, 23, 42, 0.48)",
            },
          },
        },
      },
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.20)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 3,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid transparent",
          "&.MuiAlert-colorSuccess": {
            backgroundColor: "#ECFDF5",
            borderColor: "rgba(22, 136, 95, 0.2)",
            color: "#065F46",
          },
          "&.MuiAlert-colorError": {
            backgroundColor: "#FEF2F2",
            borderColor: "rgba(185, 28, 28, 0.2)",
            color: "#7F1D1D",
          },
          "&.MuiAlert-colorWarning": {
            backgroundColor: "#FFFBEB",
            borderColor: "rgba(217, 119, 6, 0.2)",
            color: "#78350F",
          },
          "&.MuiAlert-colorInfo": {
            backgroundColor: "#EFF6FF",
            borderColor: "rgba(37, 99, 235, 0.2)",
            color: "#1E3A8A",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0F172A",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          padding: "5px 10px",
        },
        arrow: {
          color: "#0F172A",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E8EDF3",
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
