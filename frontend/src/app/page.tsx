"use client";

import ProductCard from "@/src/components/Info/ProductCard";
import AppShell from "@/src/components/Layout/AppShell";
import {
  Alert,
  Box,
  Chip,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@/src/components/Global";
import { ApiError, apiFetch } from "@/src/helpers/api";
import { useAuth } from "@/src/hooks/use-auth";
import { useProducts } from "@/src/swr/use-products";
import { Product } from "@/src/types";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";

export default function MarketplacePage() {
  const router = useRouter();
  const { currentUser, loading, accessToken, logout } = useAuth();
  const { mutate: mutateCache } = useSWRConfig();
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ordering, setOrdering] = useState("");
  const [notice, setNotice] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const { data = [], isLoading, mutate } = useProducts({
    q: searchTerm,
    minPrice,
    maxPrice,
    ordering,
  });
  const visibleProducts = inStockOnly
    ? data.filter((product) => product.available_quantity > 0)
    : data;
  const inStockCount = data.filter((product) => product.available_quantity > 0).length;

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
  }, [currentUser, loading, router]);

  const addToCart = async (product: Product, quantity: number) => {
    try {
      await apiFetch("/api/cart/items/", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ product_id: product.id, quantity }),
      });
      setNotice({
        message: `${product.title} added to cart.`,
        severity: "success",
      });
      mutate();
      if (accessToken) {
        mutateCache(["/api/cart/", accessToken]);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }
      setNotice({
        message: error instanceof Error ? error.message : "Could not add item.",
        severity: "error",
      });
    }
  };

  if (loading || !currentUser) return <LinearProgress />;

  return (
    <AppShell>
      <Stack spacing={2.5}>
        {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}
        <Paper
          variant="outlined"
          sx={{
            bgcolor: "background.paper",
            borderColor: "#E2E8F0",
            borderRadius: 2,
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
          >
            <Stack spacing={0.5} sx={{ minWidth: 160 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    alignItems: "center",
                    bgcolor: "rgba(37, 99, 235, 0.10)",
                    borderRadius: 1.25,
                    display: "flex",
                    height: 28,
                    justifyContent: "center",
                    width: 28,
                  }}
                >
                  <ShoppingCartIcon color="primary" sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="h5" sx={{ fontSize: 22, fontWeight: 800 }}>
                  Marketplace
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                Browse inventory and add products to your cart.
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { sm: "center" } }}
            >
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  minWidth: { xs: "100%", sm: 300 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FAFAFA",
                    borderRadius: 1.25,
                    height: 38,
                  },
                }}
              />
              <Stack direction="row" spacing={1}>
                <Chip
                  color={inStockOnly ? "default" : "primary"}
                  label={`${data.length} products`}
                  onClick={() => setInStockOnly(false)}
                  sx={{ cursor: "pointer" }}
                  variant={inStockOnly ? "outlined" : "filled"}
                />
                <Chip
                  color={inStockOnly ? "primary" : "default"}
                  label={`${inStockCount} in stock`}
                  onClick={() => setInStockOnly(true)}
                  sx={{ cursor: "pointer" }}
                  variant={inStockOnly ? "outlined" : "filled"}
                />
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              alignItems: { sm: "center" },
              borderTop: "1px solid #F1F5F9",
              pt: 2,
            }}
          >
            <TextField
              size="small"
              label="Min price"
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              sx={{
                width: { xs: "100%", sm: 140 },
                "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA", borderRadius: 1.25 },
              }}
            />
            <TextField
              size="small"
              label="Max price"
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: "any" } }}
              sx={{
                width: { xs: "100%", sm: 140 },
                "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA", borderRadius: 1.25 },
              }}
            />
            <TextField
              select
              size="small"
              label="Sort by"
              value={ordering}
              onChange={(event) => setOrdering(event.target.value)}
              sx={{
                width: { xs: "100%", sm: 200 },
                "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA", borderRadius: 1.25 },
              }}
            >
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="-created_at">Newest first</MenuItem>
              <MenuItem value="unit_price">Price: Low → High</MenuItem>
              <MenuItem value="-unit_price">Price: High → Low</MenuItem>
            </TextField>
          </Stack>
        </Paper>
        {isLoading && <LinearProgress />}
        <Grid container spacing={2.25}>
          {visibleProducts.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductCard
                product={product}
                canBuy={currentUser.role === "buyer"}
                onAddToCart={addToCart}
              />
            </Grid>
          ))}
        </Grid>
        {!isLoading && visibleProducts.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              borderColor: "#E2E8F0",
              borderRadius: 2,
              color: "text.secondary",
              py: 8,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>No products found</Typography>
            <Typography variant="body2">Try another search term.</Typography>
          </Paper>
        )}
      </Stack>
    </AppShell>
  );
}
