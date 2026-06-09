"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { useCart } from "@/src/swr/use-cart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@/src/components/Global";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, logout } = useAuth();
  const { data: cart } = useCart(currentUser?.role === "buyer");
  const pathname = usePathname();
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isActive = (href: string) => pathname === href;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AppBar elevation={0} position="sticky">
        <Toolbar sx={{ gap: 2, minHeight: 64, px: { xs: 2, md: 3.5 } }}>

          <Stack
            component={Link}
            direction="row"
            href="/"
            spacing={1.25}
            sx={{
              alignItems: "center",
              flexGrow: 1,
              minWidth: 160,
              textDecoration: "none",
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(37,99,235,0.28)",
                height: 36,
                width: 36,
              }}
            >
              <StorefrontIcon fontSize="small" />
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                StoreFront
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 10, lineHeight: 1.5 }}>
                Management System
              </Typography>
            </Box>
          </Stack>

          {currentUser && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>

              <Button
                color={isActive("/") ? "primary" : "inherit"}
                component={Link}
                href="/"
                size="small"
                startIcon={<StoreIcon />}
                sx={{
                  bgcolor: isActive("/") ? "rgba(37,99,235,0.09)" : "transparent",
                  borderRadius: 2.5,
                  color: isActive("/") ? "primary.main" : "text.secondary",
                  display: { xs: "none", sm: "flex" },
                  fontWeight: isActive("/") ? 800 : 600,
                  height: 32,
                  px: 1.75,
                  "&:hover": {
                    bgcolor: isActive("/") ? "rgba(37,99,235,0.13)" : "rgba(15,23,42,0.05)",
                    color: isActive("/") ? "primary.main" : "text.primary",
                  },
                }}
              >
                Marketplace
              </Button>

              {currentUser.role === "seller" && (
                <Button
                  color={isActive("/seller/products") ? "primary" : "inherit"}
                  component={Link}
                  href="/seller/products"
                  size="small"
                  startIcon={<Inventory2Icon />}
                  sx={{
                    bgcolor: isActive("/seller/products")
                      ? "rgba(37,99,235,0.09)"
                      : "transparent",
                    borderRadius: 2.5,
                    color: isActive("/seller/products") ? "primary.main" : "text.secondary",
                    display: { xs: "none", sm: "flex" },
                    fontWeight: isActive("/seller/products") ? 800 : 600,
                    height: 32,
                    px: 1.75,
                    "&:hover": {
                      bgcolor: isActive("/seller/products")
                        ? "rgba(37,99,235,0.13)"
                        : "rgba(15,23,42,0.05)",
                      color: isActive("/seller/products") ? "primary.main" : "text.primary",
                    },
                  }}
                >
                  Products
                </Button>
              )}

              {currentUser.role === "buyer" && (
                <Button
                  color={isActive("/cart") ? "primary" : "inherit"}
                  component={Link}
                  data-cart-target="true"
                  href="/cart"
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  sx={{
                    bgcolor: isActive("/cart") ? "rgba(37,99,235,0.09)" : "transparent",
                    borderRadius: 2.5,
                    color: isActive("/cart") ? "primary.main" : "text.secondary",
                    display: { xs: "none", sm: "flex" },
                    fontWeight: isActive("/cart") ? 800 : 600,
                    height: 32,
                    px: 1.75,
                    gap: 0.5,
                    "&:hover": {
                      bgcolor: isActive("/cart")
                        ? "rgba(37,99,235,0.13)"
                        : "rgba(15,23,42,0.05)",
                      color: isActive("/cart") ? "primary.main" : "text.primary",
                    },
                  }}
                >
                  Cart
                  {cartCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        alignItems: "center",
                        bgcolor: "primary.main",
                        borderRadius: "10px",
                        color: "#fff",
                        display: "inline-flex",
                        fontSize: 10,
                        fontWeight: 800,
                        height: 18,
                        justifyContent: "center",
                        lineHeight: 1,
                        minWidth: 18,
                        px: "4px",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Box>
                  )}
                </Button>
              )}

              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  bgcolor: currentUser.role === "seller" ? "rgba(235,168,50,0.12)" : "rgba(37,99,235,0.08)",
                  borderRadius: 2.5,
                  height: 32,
                  px: 1.25,
                }}
              >
                <AccountCircleIcon
                  sx={{
                    color: currentUser.role === "seller" ? "#A86808" : "primary.dark",
                    fontSize: 16,
                  }}
                />
                <Typography
                  sx={{
                    color: currentUser.role === "seller" ? "#A86808" : "primary.dark",
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {currentUser.role}
                </Typography>
              </Stack>

              <Tooltip title="Logout">
                <IconButton
                  onClick={logout}
                  size="small"
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 2,
                    color: "text.secondary",
                    height: 32,
                    width: 32,
                    "&:hover": { bgcolor: "#FEF2F2", borderColor: "transparent", color: "error.main" },
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}
