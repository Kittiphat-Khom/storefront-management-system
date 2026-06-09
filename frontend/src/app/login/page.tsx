"use client";

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/components/Global";
import { useAuth } from "@/src/hooks/use-auth";
import { Role } from "@/src/types";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";

interface FieldErrors {
  email?: string;
  username?: string;
  password?: string;
}

const DEMO_ACCOUNTS = [
  { label: "Buyer", email: "buyer@example.com", role: "buyer" as Role },
  { label: "Seller", email: "seller@example.com", role: "seller" as Role },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("buyer@example.com");
  const [username, setUsername] = useState("buyer");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<Role>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (mode === "register" && !username.trim()) errs.username = "Username is required.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, username, password, role });
      }
    } catch (event) {
      setError(event instanceof Error ? event.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setFieldErrors({});
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setMode("login");
    setEmail(account.email);
    setPassword("password123");
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.10) 0%, transparent 70%), #F8FAFC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        py: 6,
      }}
    >
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid rgba(15,23,42,0.07)",
          borderRadius: "16px",
          boxShadow:
            "0 0 0 1px rgba(15,23,42,0.03), 0 4px 6px rgba(15,23,42,0.04), 0 16px 40px rgba(15,23,42,0.07)",
          maxWidth: 440,
          p: { xs: 3.5, sm: 5 },
          width: "100%",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center", justifyContent: "center", mb: 4 }}
        >
          <Box
            sx={{
              alignItems: "center",
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
              color: "#fff",
              display: "flex",
              height: 38,
              justifyContent: "center",
              width: 38,
            }}
          >
            <StorefrontIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography
            sx={{ color: "#0F172A", fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}
          >
            StoreFront
          </Typography>
        </Stack>

        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography
            sx={{
              color: "#0F172A",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Typography>
          <Typography sx={{ color: "#64748B", fontSize: 14 }}>
            {mode === "login"
              ? "Sign in to your StoreFront account."
              : "Start selling or browsing today."}
          </Typography>
        </Box>

        <Stack spacing={2}>
          {error && <Alert severity="error" sx={{ py: 0.75 }}>{error}</Alert>}

          <TextField
            autoFocus
            error={!!fieldErrors.email}
            fullWidth
            helperText={fieldErrors.email}
            label="Email or username"
            size="small"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {mode === "register" && (
            <>
              <TextField
                error={!!fieldErrors.username}
                fullWidth
                helperText={fieldErrors.username}
                label="Username"
                size="small"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => ({ ...p, username: undefined })); }}
              />
              <TextField
                select
                fullWidth
                label="Account type"
                size="small"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <MenuItem value="buyer">
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", py: 0.25 }}>
                    <ShoppingBagIcon sx={{ color: "#2563EB", fontSize: 16 }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Buyer</Typography>
                      <Typography sx={{ color: "#94A3B8", fontSize: 11 }}>Browse & purchase items</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
                <MenuItem value="seller">
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", py: 0.25 }}>
                    <InventoryIcon sx={{ color: "#D97706", fontSize: 16 }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Seller</Typography>
                      <Typography sx={{ color: "#94A3B8", fontSize: 11 }}>List & manage products</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              </TextField>
            </>
          )}

          <TextField
            error={!!fieldErrors.password}
            fullWidth
            helperText={fieldErrors.password}
            label="Password"
            size="small"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((v) => !v)}
                      size="small"
                      tabIndex={-1}
                    >
                      {showPassword
                        ? <VisibilityOffIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                        : <VisibilityIcon sx={{ fontSize: 18, color: "#94A3B8" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            disabled={loading}
            fullWidth
            onClick={submit}
            size="large"
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(37,99,235,0.20)",
              fontWeight: 700,
              letterSpacing: "0.01em",
              minHeight: 42,
              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8 0%, #1e3a8a 100%)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.32)",
              },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </Stack>

        <Typography
          sx={{ color: "#64748B", fontSize: 13, mt: 2.5, textAlign: "center" }}
        >
          {mode === "login" ? "New to StoreFront? " : "Already have an account? "}
          <Box
            component="span"
            onClick={switchMode}
            sx={{
              color: "#2563EB",
              cursor: "pointer",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {mode === "login" ? "Create account" : "Sign in"}
          </Box>
        </Typography>

        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            gap: 1.5,
            mt: 3,
          }}
        >
          <Box sx={{ bgcolor: "#E2E8F0", flex: 1, height: "1px" }} />
          <Typography sx={{ color: "#94A3B8", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
            DEMO ACCOUNTS
          </Typography>
          <Box sx={{ bgcolor: "#E2E8F0", flex: 1, height: "1px" }} />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          {DEMO_ACCOUNTS.map((account) => (
            <Box
              key={account.label}
              onClick={() => fillDemo(account)}
              sx={{
                alignItems: "center",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: 0.25,
                py: 1.25,
                transition: "border-color 120ms, background 120ms",
                "&:hover": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#2563EB",
                },
              }}
            >
              <Typography sx={{ color: "#0F172A", fontSize: 12, fontWeight: 700 }}>
                {account.label}
              </Typography>
              <Typography sx={{ color: "#94A3B8", fontFamily: "monospace", fontSize: 10 }}>
                {account.email}
              </Typography>
              <Typography sx={{ color: "#CBD5E1", fontSize: 10 }}>
                password123
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
