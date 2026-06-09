"use client";

import AppShell from "@/src/components/Layout/AppShell";
import {
  Button,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@/src/components/Global";
import { formatPrice } from "@/src/decorators/product";
import { ApiError, apiFetch, getMediaUrl } from "@/src/helpers/api";
import { useAuth } from "@/src/hooks/use-auth";
import { useCart } from "@/src/swr/use-cart";
import { useOrders } from "@/src/swr/use-orders";
import { Order } from "@/src/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const { currentUser, loading, accessToken, logout } = useAuth();
  const { data: cart, isLoading, mutate } = useCart();
  const { data: orders = [], mutate: mutateOrders } = useOrders();
  const [checkoutState, setCheckoutState] = useState<"idle" | "processing" | "success">("idle");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
    if (!loading && currentUser?.role !== "buyer") router.push("/");
  }, [currentUser, loading, router]);

  const total = useMemo(
    () => Number(cart?.total || 0),
    [cart],
  );
  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = async () => {
    setError("");
    setCheckoutState("processing");
    try {
      const order = await apiFetch<Order>("/api/orders/checkout/", {
        method: "POST",
        token: accessToken,
      });
      mutate();
      mutateOrders();
      setCompletedOrder(order);
      setCheckoutState("success");
    } catch (event) {
      setCheckoutState("idle");
      if (event instanceof ApiError && event.status === 401) {
        logout();
        return;
      }
      setError(event instanceof Error ? event.message : "Checkout failed.");
    }
  };
  const removeItem = async (id: number) => {
    setError("");
    setRemovingItemId(id);
    try {
      await apiFetch(`/api/cart/items/${id}/`, {
        method: "DELETE",
        token: accessToken,
      });
      mutate();
    } catch (event) {
      if (event instanceof ApiError && event.status === 401) {
        logout();
        return;
      }
      setError(event instanceof Error ? event.message : "Could not remove item.");
    } finally {
      setRemovingItemId(null);
    }
  };
  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }
    setError("");
    setUpdatingItemId(id);
    try {
      await apiFetch(`/api/cart/items/${id}/`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ quantity }),
      });
      mutate();
    } catch (event) {
      if (event instanceof ApiError && event.status === 401) {
        logout();
        return;
      }
      setError(event instanceof Error ? event.message : "Could not update item.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading || !currentUser) return <LinearProgress />;

  return (
    <AppShell>
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        <Box>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Cart
            </Typography>
            <Chip label={`${cartCount} item${cartCount === 1 ? "" : "s"}`} />
          </Stack>
          <Typography color="text.secondary" variant="body2">
            Review items and place your order.
          </Typography>
        </Box>

        {isLoading && <LinearProgress />}
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          }}
        >
          <Paper
            variant="outlined"
            sx={{ borderColor: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}
          >
            {cartItems.length === 0 ? (
              <Stack sx={{ alignItems: "center", color: "text.secondary", py: 9 }}>
                <ShoppingCartIcon sx={{ color: "#CBD5E1", fontSize: 46, mb: 1.5 }} />
                <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
                  Your cart is empty
                </Typography>
                <Typography variant="body2">Add items from the marketplace.</Typography>
              </Stack>
            ) : (
              cartItems.map((item, index) => {
                const imageUrl = getMediaUrl(item.product.image);

                return (
                <Box key={item.id}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.75}
                    sx={{
                      alignItems: { xs: "stretch", sm: "center" },
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        alignItems: "center",
                        background: "linear-gradient(135deg, #EEF2F7, #E2EAF4)",
                        borderRadius: 1.5,
                        color: "#64748B",
                        display: "flex",
                        height: 64,
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                        flexShrink: 0,
                        width: 64,
                      }}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.product.title}
                          fill
                          sizes="64px"
                          unoptimized
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <ShoppingBagIcon />
                      )}
                    </Box>
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }}>{item.product.title}</Typography>
                      <Typography
                        color="primary"
                        sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatPrice(item.product.unit_price)}฿
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: 1.25,
                          flexShrink: 0,
                          height: 38,
                          overflow: "hidden",
                          width: 128,
                        }}
                      >
                        <IconButton
                          aria-label="Decrease quantity"
                          disabled={updatingItemId === item.id}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          size="small"
                          sx={{ borderRadius: 0, height: 38, width: 40 }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography
                          sx={{
                            minWidth: 28,
                            flex: 1,
                            textAlign: "center",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          aria-label="Increase quantity"
                          disabled={
                            updatingItemId === item.id ||
                            item.quantity >= item.product.available_quantity
                          }
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          size="small"
                          sx={{ borderRadius: 0, height: 38, width: 40 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatPrice(item.line_total)}฿
                      </Typography>
                      <IconButton
                        aria-label="Remove item"
                        color="error"
                        disabled={removingItemId === item.id}
                        onClick={() => removeItem(item.id)}
                        size="small"
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {index < cartItems.length - 1 && <Divider />}
                </Box>
              );
              })
            )}
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              borderColor: "#E2E8F0",
              borderRadius: 2,
              p: 2.5,
              position: { md: "sticky" },
              top: 76,
            }}
          >
            <Typography sx={{ fontWeight: 800, mb: 2 }}>Order Summary</Typography>
            <Stack spacing={1.25}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography color="text.secondary" variant="body2">
                  Items ({cartCount})
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {formatPrice(total)}฿
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography color="text.secondary" variant="body2">
                  Shipping
                </Typography>
                <Typography color="success.main" sx={{ fontWeight: 700 }} variant="body2">
                  Free
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(total)}฿
                </Typography>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                disabled={cartItems.length === 0 || checkoutState === "processing"}
                startIcon={<ShoppingBagIcon />}
                onClick={checkout}
                sx={{ mt: 0.75, minHeight: 46 }}
              >
                Checkout
              </Button>
              {cartItems.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="caption">
                  Add items to checkout
                </Typography>
              )}
            </Stack>
          </Paper>
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Past Orders</Typography>
          <Paper
            variant="outlined"
            sx={{ borderColor: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}
          >
            {orders.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                No orders yet.
              </Typography>
            ) : (
              orders.map((order, index) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <Box key={order.id}>
                    <Stack
                      direction="row"
                      spacing={1.75}
                      sx={{
                        alignItems: "center",
                        cursor: "pointer",
                        p: 2,
                        transitionProperty: "background-color",
                        transitionDuration: "120ms",
                        "&:hover": { bgcolor: "#FAFBFC" },
                      }}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <Box
                        sx={{
                          alignItems: "center",
                          bgcolor: "rgba(37, 99, 235, 0.10)",
                          borderRadius: 1.25,
                          color: "primary.main",
                          display: "flex",
                          height: 40,
                          justifyContent: "center",
                          width: 40,
                          flexShrink: 0,
                        }}
                      >
                        <ShoppingBagIcon fontSize="small" />
                      </Box>
                      <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                          <Chip color="success" label={order.status} size="small" />
                        </Stack>
                        <Typography color="text.secondary" variant="body2">
                          {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                        {formatPrice(order.total_amount)}฿
                      </Typography>
                      <ExpandMoreIcon
                        sx={{
                          color: "text.secondary",
                          fontSize: 20,
                          flexShrink: 0,
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 200ms ease",
                        }}
                      />
                    </Stack>
                    <Collapse in={isExpanded}>
                      <Box sx={{ bgcolor: "#FAFBFC", borderTop: "1px solid #F1F5F9", px: 2.5, py: 1.5 }}>
                        <Stack spacing={1.25}>
                          {order.items.map((item) => (
                            <Stack
                              key={item.id}
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: "center" }}
                            >
                              <Box
                                sx={{
                                  bgcolor: "#EEF2F7",
                                  borderRadius: 1,
                                  flexShrink: 0,
                                  height: 36,
                                  overflow: "hidden",
                                  position: "relative",
                                  width: 36,
                                }}
                              >
                                {item.product.image ? (
                                  <Image
                                    src={getMediaUrl(item.product.image) as string}
                                    alt={item.product.title}
                                    fill
                                    unoptimized
                                    style={{ objectFit: "contain", padding: "3px" }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      alignItems: "center",
                                      color: "#CBD5E1",
                                      display: "flex",
                                      height: "100%",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <ShoppingBagIcon sx={{ fontSize: 16 }} />
                                  </Box>
                                )}
                              </Box>
                              <Typography
                                sx={{
                                  flex: 1,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.product.title}
                              </Typography>
                              <Typography color="text.secondary" variant="caption" sx={{ flexShrink: 0 }}>
                                ×{item.quantity}
                              </Typography>
                              <Typography
                                sx={{ flexShrink: 0, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
                              >
                                {formatPrice(item.line_total)}฿
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Collapse>
                    {index < orders.length - 1 && <Divider />}
                  </Box>
                );
              })
            )}
          </Paper>
        </Box>
      </Stack>

      <Dialog
        open={checkoutState !== "idle"}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {checkoutState === "processing" ? (
            <Box sx={{ py: 6, px: 3, textAlign: "center" }}>
              <Box sx={{ display: "inline-flex", mb: 3, position: "relative" }}>
                <CircularProgress
                  size={80}
                  thickness={1.5}
                  sx={{ color: "primary.main" }}
                />
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    inset: 0,
                    justifyContent: "center",
                    position: "absolute",
                  }}
                >
                  <ShoppingBagIcon sx={{ color: "primary.main", fontSize: 30 }} />
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }} variant="h6">
                Processing order…
              </Typography>
              <Typography color="text.secondary" variant="body2">
                This won&apos;t take long
              </Typography>
            </Box>
          ) : completedOrder ? (
            <Box>
              <Box sx={{ bgcolor: "#ECFDF5", py: 4, textAlign: "center" }}>
                <Box
                  sx={{
                    alignItems: "center",
                    bgcolor: "#10B981",
                    borderRadius: "50%",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.28)",
                    color: "#fff",
                    display: "inline-flex",
                    height: 68,
                    justifyContent: "center",
                    mb: 2,
                    width: 68,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 38 }} />
                </Box>
                <Typography sx={{ fontWeight: 800 }} variant="h6">
                  Order placed!
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Order #{completedOrder.id}
                </Typography>
              </Box>

              <Box sx={{ p: 2.5 }}>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {completedOrder.items.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#EEF2F7",
                          borderRadius: 1,
                          flexShrink: 0,
                          height: 36,
                          overflow: "hidden",
                          position: "relative",
                          width: 36,
                        }}
                      >
                        {item.product.image ? (
                          <Image
                            src={getMediaUrl(item.product.image) as string}
                            alt={item.product.title}
                            fill
                            unoptimized
                            style={{ objectFit: "contain", padding: "3px" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              alignItems: "center",
                              color: "#CBD5E1",
                              display: "flex",
                              height: "100%",
                              justifyContent: "center",
                            }}
                          >
                            <ShoppingBagIcon sx={{ fontSize: 16 }} />
                          </Box>
                        )}
                      </Box>
                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.product.title}
                      </Typography>
                      <Typography color="text.secondary" variant="caption" sx={{ flexShrink: 0 }}>
                        ×{item.quantity}
                      </Typography>
                      <Typography
                        sx={{
                          flexShrink: 0,
                          fontSize: 13,
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: 700,
                        }}
                      >
                        {formatPrice(item.line_total)}฿
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Divider />
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between", mt: 1.5, mb: 2 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }} variant="h6">
                    {formatPrice(completedOrder.total_amount)}฿
                  </Typography>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ borderRadius: 2, minHeight: 44 }}
                  onClick={() => {
                    setCheckoutState("idle");
                    setCompletedOrder(null);
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
