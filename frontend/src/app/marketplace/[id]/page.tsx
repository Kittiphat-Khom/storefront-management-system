"use client";

import AppShell from "@/src/components/Layout/AppShell";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@/src/components/Global";
import { decorateProduct, formatPrice } from "@/src/decorators/product";
import { ApiError, apiFetch, getMediaUrl } from "@/src/helpers/api";
import { useAuth } from "@/src/hooks/use-auth";
import { useCustomSWR } from "@/src/swr/use-custom-swr";
import { Product } from "@/src/types";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import RemoveIcon from "@mui/icons-material/Remove";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { currentUser, loading, accessToken, logout } = useAuth();
  const { mutate: mutateCache } = useSWRConfig();
  const { data: product, isLoading } = useCustomSWR<Product>(
    id ? `/api/marketplace/${id}/` : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
  }, [currentUser, loading, router]);

  const addToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await apiFetch("/api/cart/items/", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ product_id: product.id, quantity }),
      });
      setNotice({ message: `${product.title} added to cart.`, severity: "success" });
      if (accessToken) mutateCache(["/api/cart/", accessToken]);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }
      setNotice({
        message: error instanceof Error ? error.message : "Could not add item.",
        severity: "error",
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading || !currentUser) return <LinearProgress />;

  if (isLoading) {
    return (
      <AppShell>
        <LinearProgress />
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell>
        <Stack spacing={2}>
          <Button
            color="inherit"
            onClick={() => router.back()}
            startIcon={<ArrowBackIcon />}
            sx={{ alignSelf: "flex-start", color: "text.secondary" }}
          >
            Back
          </Button>
          <Typography color="text.secondary">Product not found.</Typography>
        </Stack>
      </AppShell>
    );
  }

  const decorated = decorateProduct(product);
  const imageUrl = getMediaUrl(product.image);
  const isOut = product.available_quantity <= 0;
  const isLow = product.available_quantity > 0 && product.available_quantity <= 2;
  const stockColor = isOut ? "error" : isLow ? "warning" : "success";
  const stockLabel = isOut
    ? "Out of stock"
    : isLow
      ? `${product.available_quantity} left`
      : "In stock";
  const isBuyer = currentUser.role === "buyer";

  return (
    <AppShell>
      <Stack spacing={2.5}>
        {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}
        <Button
          color="inherit"
          onClick={() => router.back()}
          startIcon={<ArrowBackIcon />}
          sx={{ alignSelf: "flex-start", color: "text.secondary" }}
        >
          Back
        </Button>
        <Paper
          variant="outlined"
          sx={{ borderColor: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "380px 1fr" },
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(150deg, #EEF2F7 0%, #E2EAF4 100%)",
                borderBottom: { xs: "1px solid #E2E8F0", md: "none" },
                borderRight: { md: "1px solid #E2E8F0" },
                height: { xs: 280, md: "100%" },
                minHeight: { md: 440 },
                position: "relative",
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Stack
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    color: "#94A3B8",
                    height: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      alignItems: "center",
                      color: "#64748B",
                      display: "flex",
                      filter: "drop-shadow(0 3px 8px rgba(0, 0, 0, 0.10))",
                      height: 64,
                      justifyContent: "center",
                      width: 64,
                    }}
                  >
                    <ImageNotSupportedIcon sx={{ fontSize: 54 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em" }}
                  >
                    PRODUCT IMAGE
                  </Typography>
                </Stack>
              )}
            </Box>

            <Stack spacing={2.5} sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Chip color={stockColor} label={stockLabel} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    by {product.seller_name || product.seller?.username || "seller"}
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {product.title}
                </Typography>
                <Typography
                  color="primary"
                  sx={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
                >
                  {decorated.displayPrice}
                </Typography>
              </Stack>

              <Divider />

              <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                {product.description}
              </Typography>

              <Divider />

              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Stock:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {product.available_quantity}{" "}
                  {product.available_quantity === 1 ? "unit" : "units"} available
                </Typography>
              </Stack>

              {isBuyer && (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: 1.25,
                      flexShrink: 0,
                      height: 42,
                      overflow: "hidden",
                      width: 128,
                    }}
                  >
                    <IconButton
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                      size="small"
                      sx={{ borderRadius: 0, height: 42, width: 40 }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography
                      sx={{
                        flex: 1,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 28,
                        textAlign: "center",
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      aria-label="Increase quantity"
                      disabled={quantity >= product.available_quantity}
                      onClick={() => setQuantity((v) => Math.min(product.available_quantity, v + 1))}
                      size="small"
                      sx={{ borderRadius: 0, height: 42, width: 40 }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Button
                    disabled={isOut || adding}
                    onClick={addToCart}
                    startIcon={<AddShoppingCartIcon />}
                    sx={{ minHeight: 42, px: 3 }}
                    variant="contained"
                  >
                    {adding ? "Adding…" : "Add to Cart"}
                  </Button>
                </Stack>
              )}

              {!isBuyer && (
                <Typography color="text.secondary" variant="body2">
                  Sign in as a buyer to purchase this product.
                </Typography>
              )}
            </Stack>
          </Box>
        </Paper>

        {isBuyer && !isOut && (
          <Paper
            variant="outlined"
            sx={{
              borderColor: "#E2E8F0",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography color="text.secondary" variant="body2">
                {quantity} × {decorated.displayPrice}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                {formatPrice(Number(product.unit_price) * quantity)}฿
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
    </AppShell>
  );
}
