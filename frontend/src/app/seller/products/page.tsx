"use client";

import ProductForm from "@/src/components/Forms/ProductForm";
import AppShell from "@/src/components/Layout/AppShell";
import ProductTable from "@/src/components/Tables/ProductTable";
import {
  Button,
  Alert,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@/src/components/Global";
import { formatPrice } from "@/src/decorators/product";
import { ApiError, apiFetch } from "@/src/helpers/api";
import { useAuth } from "@/src/hooks/use-auth";
import { useProducts } from "@/src/swr/use-products";
import { Product } from "@/src/types";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerProductsPage() {
  const router = useRouter();
  const { currentUser, loading, accessToken, logout } = useAuth();
  const { data = [], isLoading, mutate } = useProducts({ mine: true });
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inventoryValue = data.reduce(
    (sum, product) =>
      sum + Number(product.unit_price) * product.available_quantity,
    0,
  );
  const stats = [
    { label: "Total Products", value: data.length, color: "text.primary" },
    {
      label: "In Stock",
      value: data.filter((product) => product.available_quantity > 0).length,
      color: "success.main",
    },
    {
      label: "Low Stock",
      value: data.filter(
        (product) =>
          product.available_quantity > 0 && product.available_quantity <= 2,
      ).length,
      color: "warning.main",
    },
    {
      label: "Inventory Value",
      value: `${formatPrice(inventoryValue)}฿`,
      color: "primary.main",
    },
  ];

  useEffect(() => {
    if (!loading && !currentUser) router.push("/login");
    if (!loading && currentUser?.role !== "seller") router.push("/");
  }, [currentUser, loading, router]);

  const submit = async (formData: FormData, id?: number) => {
    setError("");
    setSaving(true);
    try {
      await apiFetch(`/api/products/${id ? `${id}/` : ""}`, {
        method: id ? "PATCH" : "POST",
        token: accessToken,
        body: formData,
        isFormData: true,
      });
      setOpen(false);
      setCurrentProduct(null);
      mutate();
    } catch (event) {
      if (event instanceof ApiError && event.status === 401) {
        logout();
        return;
      }
      setError(event instanceof Error ? event.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };
  const deleteProduct = async (product: Product) => {
    const ok = window.confirm(`Delete ${product.title}?`);
    if (!ok) return;
    setError("");
    try {
      await apiFetch(`/api/products/${product.id}/`, {
        method: "DELETE",
        token: accessToken,
      });
      mutate();
    } catch (event) {
      setError(event instanceof Error ? event.message : "Could not delete product.");
    }
  };

  if (loading || !currentUser) return <LinearProgress />;

  return (
    <AppShell>
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper
          variant="outlined"
          sx={{
            borderColor: "#E2E8F0",
            borderRadius: 2,
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { sm: "flex-start" }, justifyContent: "space-between" }}
          >
            <Stack spacing={0.6}>
              <Chip
                label="Seller workspace"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "#F1F5F9",
                  color: "text.secondary",
                  textTransform: "uppercase",
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Product Inventory
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Create, edit, and manage your storefront listings.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              New Product
            </Button>
          </Stack>
        </Paper>

        <Grid container spacing={1.75}>
          {stats.map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  borderColor: "#E2E8F0",
                  borderRadius: 1.75,
                  p: 2,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  {stat.label}
                </Typography>
                <Typography
                  sx={{
                    color: stat.color,
                    fontSize: 22,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    mt: 0.75,
                  }}
                >
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          variant="outlined"
          sx={{ borderColor: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}
        >
            <ProductTable
              data={data}
              loading={isLoading}
              onDelete={deleteProduct}
              onEdit={(product) => {
                setCurrentProduct(product);
                setOpen(true);
              }}
            />
        </Paper>
      </Stack>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{currentProduct ? "Edit Product" : "New Product"}</DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          <ProductForm
            initialData={currentProduct}
            loading={saving}
            onCancel={() => {
              setCurrentProduct(null);
              setOpen(false);
            }}
            onSubmit={submit}
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
