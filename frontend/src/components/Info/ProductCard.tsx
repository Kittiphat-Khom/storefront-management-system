"use client";

import { decorateProduct } from "@/src/decorators/product";
import { getMediaUrl } from "@/src/helpers/api";
import { Product } from "@/src/types";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@/src/components/Global";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type ProductCardProps = {
  product: Product;
  canBuy: boolean;
  onAddToCart: (product: Product, quantity: number) => Promise<void>;
};

export default function ProductCard({
  product,
  canBuy,
  onAddToCart,
}: ProductCardProps) {
  const decorated = decorateProduct(product);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [flight, setFlight] = useState<{
    dx: number;
    dy: number;
    left: number;
    top: number;
  } | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const imageUrl = getMediaUrl(product.image);
  const availableQuantity = Number(product.available_quantity);
  const isOut = availableQuantity <= 0;
  const isLow = availableQuantity > 0 && availableQuantity <= 2;
  const canDecrease = quantity > 1;
  const canIncrease = quantity < availableQuantity;
  const stockLabel = isOut
    ? "Out of stock"
    : isLow
      ? `${availableQuantity} left`
      : "In stock";
  const stockColor = isOut ? "error" : isLow ? "warning" : "success";

  const animateToCart = () => {
    const source = addButtonRef.current?.getBoundingClientRect();
    const target = document
      .querySelector("[data-cart-target='true']")
      ?.getBoundingClientRect();
    if (!source || !target) return;

    const startX = source.left + source.width / 2 - 18;
    const startY = source.top + source.height / 2 - 18;
    const endX = target.left + target.width / 2 - 18;
    const endY = target.top + target.height / 2 - 18;
    setFlight({
      dx: endX - startX,
      dy: endY - startY,
      left: startX,
      top: startY,
    });
    window.setTimeout(() => setFlight(null), 720);
  };

  const handleAdd = async () => {
    setAdding(true);
    animateToCart();
    try {
      await onAddToCart(product, quantity);
    } finally {
      setAdding(false);
    }
  };
  const decreaseQuantity = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };
  const increaseQuantity = () => {
    setQuantity((value) => Math.min(availableQuantity, value + 1));
  };

  return (
    <Card
      sx={{
        borderRadius: 1.5,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        transitionProperty: "border-color, box-shadow, transform, background-color",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-out",
        "&:hover": {
          borderColor: "rgba(37, 99, 235, 0.32)",
          boxShadow: "0 10px 32px rgba(15, 23, 42, 0.13)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        component={Link}
        href={`/marketplace/${product.id}`}
        sx={{
          background: "linear-gradient(150deg, #EEF2F7 0%, #E2EAF4 100%)",
          borderBottom: "1px solid rgba(17, 24, 39, 0.06)",
          display: "block",
          height: 190,
          position: "relative",
          textDecoration: "none",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            unoptimized
            style={{ objectFit: "contain", padding: "8px" }}
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
                height: 54,
                justifyContent: "center",
                width: 54,
              }}
            >
              <ImageNotSupportedIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography
              variant="caption"
              sx={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em" }}
            >
              PRODUCT IMAGE
            </Typography>
          </Stack>
        )}
        <Chip
          color={stockColor}
          label={stockLabel}
          size="small"
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Stack spacing={1.25}>
          <Typography
            component={Link}
            href={`/marketplace/${product.id}`}
            variant="subtitle1"
            sx={{
              color: "inherit",
              fontWeight: 700,
              lineHeight: 1.25,
              textDecoration: "none",
              textWrap: "balance",
              "&:hover": { color: "primary.main" },
            }}
          >
            {product.title}
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontSize: 21, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
          >
            {decorated.displayPrice}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              display: "-webkit-box",
              overflow: "hidden",
              textWrap: "pretty",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {product.description}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              label={`${product.available_quantity} available`}
              size="small"
              sx={{
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "text.secondary",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              by {product.seller_name || product.seller?.username || "seller"}
            </Typography>
          </Stack>
          <Typography
            component={Link}
            href={`/marketplace/${product.id}`}
            variant="caption"
            sx={{
              alignItems: "center",
              color: "primary.main",
              display: "flex",
              fontWeight: 600,
              gap: 0.25,
              mt: 0.5,
              opacity: 0.75,
              textDecoration: "none",
              "&:hover": { opacity: 1, textDecoration: "underline" },
            }}
          >
            View details →
          </Typography>
        </Stack>
      </CardContent>
      {canBuy && (
        <CardActions sx={{ p: 2.5, pt: 0 }}>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                border: "1.5px solid #E2E8F0",
                borderRadius: 1.25,
                flexShrink: 0,
                height: 38,
                overflow: "hidden",
                width: 112,
              }}
            >
              <IconButton
                aria-label="Decrease quantity"
                disabled={!canDecrease}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  decreaseQuantity();
                }}
                size="small"
                sx={{
                  borderRadius: 0,
                  color: canDecrease ? "text.secondary" : "#CBD5E1",
                  height: 38,
                  width: 36,
                }}
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
                {quantity}
              </Typography>
              <IconButton
                aria-label="Increase quantity"
                disabled={!canIncrease}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  increaseQuantity();
                }}
                size="small"
                sx={{
                  borderRadius: 0,
                  color: canIncrease ? "text.secondary" : "#CBD5E1",
                  height: 38,
                  width: 36,
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Button
              ref={addButtonRef}
              fullWidth
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              disabled={isOut || adding}
              onClick={handleAdd}
              sx={{
                minHeight: 38,
                minWidth: 0,
                px: 1,
                whiteSpace: "nowrap",
                "& .MuiButton-startIcon": {
                  mr: 0.5,
                },
              }}
            >
              {adding ? "Adding" : "Add"}
            </Button>
          </Stack>
        </CardActions>
      )}
      {flight && (
        <Box
          sx={{
            alignItems: "center",
            animation: "fly-to-cart 720ms cubic-bezier(.2,.78,.2,1) forwards",
            bgcolor: "primary.main",
            borderRadius: "50%",
            boxShadow: "0 10px 18px rgba(31, 94, 255, 0.24)",
            color: "white",
            display: "flex",
            height: 36,
            justifyContent: "center",
            left: flight.left,
            pointerEvents: "none",
            position: "fixed",
            top: flight.top,
            width: 36,
            zIndex: 2000,
            "--fly-x": `${flight.dx}px`,
            "--fly-y": `${flight.dy}px`,
          }}
        >
          <AddShoppingCartIcon fontSize="small" />
        </Box>
      )}
    </Card>
  );
}
