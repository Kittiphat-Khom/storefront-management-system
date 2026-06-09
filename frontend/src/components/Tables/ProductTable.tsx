"use client";

import { decorateProduct } from "@/src/decorators/product";
import { getMediaUrl } from "@/src/helpers/api";
import { Product } from "@/src/types";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@/src/components/Global";
import Image from "next/image";

type ProductTableProps = {
  data: Product[];
  loading?: boolean;
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
};

export default function ProductTable({
  data,
  loading = false,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <Box sx={{ overflowX: "auto", width: "100%" }}>
      {loading && <LinearProgress />}
      <Box sx={{ minWidth: 760 }}>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
            color: "#94A3B8",
            display: "grid",
            fontSize: 11,
            fontWeight: 800,
            gridTemplateColumns: "96px minmax(260px, 1fr) 120px 90px 160px",
            height: 44,
            letterSpacing: "0.06em",
            px: 2,
            textTransform: "uppercase",
          }}
        >
          <span />
          <span>Product</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
        </Box>
        {data.length === 0 && !loading ? (
          <Stack sx={{ alignItems: "center", color: "text.secondary", py: 8 }}>
            <Typography sx={{ fontWeight: 700 }}>No products yet</Typography>
            <Typography variant="body2">Create your first storefront listing.</Typography>
          </Stack>
        ) : (
          data.map((product) => {
            const decorated = decorateProduct(product);

            const imageUrl = getMediaUrl(product.image);

            return (
              <Box
                key={product.id}
                sx={{
                  alignItems: "center",
                  borderBottom: "1px solid #E2E8F0",
                  display: "grid",
                  gridTemplateColumns:
                    "96px minmax(260px, 1fr) 120px 90px 160px",
                  minHeight: 68,
                  px: 2,
                  transitionProperty: "background-color",
                  transitionDuration: "120ms",
                  "&:hover": { bgcolor: "#FAFBFC" },
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Stack direction="row" spacing={0.75}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(product)}
                      sx={{
                        bgcolor: "#F1F5F9",
                        borderRadius: 1,
                        height: 40,
                        width: 40,
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {onDelete && (
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onDelete(product)}
                        sx={{
                          bgcolor: "#FEF2F2",
                          borderRadius: 1,
                          height: 40,
                          width: 40,
                        }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                  <Box
                    sx={{
                      bgcolor: "#F1F5F9",
                      borderRadius: 1,
                      flexShrink: 0,
                      height: 40,
                      overflow: "hidden",
                      position: "relative",
                      width: 40,
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        unoptimized
                        style={{ objectFit: "contain", padding: "4px" }}
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
                        <ImageNotSupportedIcon sx={{ fontSize: 20 }} />
                      </Box>
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={product.title}
                  >
                    {product.title}
                  </Typography>
                </Stack>
                <Typography
                  color="primary"
                  sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
                >
                  {decorated.displayPrice}
                </Typography>
                <Typography sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {product.available_quantity}
                </Typography>
                <Chip
                  color={product.available_quantity > 0 ? "success" : "default"}
                  label={decorated.displayStock}
                  size="small"
                  sx={{ justifySelf: "start" }}
                />
              </Box>
            );
          })
        )}
        <Box
          sx={{
            alignItems: "center",
            bgcolor: "#F8FAFC",
            borderTop: data.length > 0 ? "1px solid #E2E8F0" : 0,
            color: "text.secondary",
            display: "flex",
            fontSize: 12,
            justifyContent: "flex-end",
            minHeight: 44,
            px: 2,
          }}
        >
          1-{data.length} of {data.length}
        </Box>
      </Box>
    </Box>
  );
}
