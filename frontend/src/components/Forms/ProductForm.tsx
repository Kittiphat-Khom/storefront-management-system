"use client";

import {
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@/src/components/Global";
import { Product } from "@/src/types";
import { ChangeEvent, useState } from "react";

type ProductFormProps = {
  initialData?: Product | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData, id?: number) => Promise<void>;
};

interface FieldErrors {
  title?: string;
  description?: string;
  unitPrice?: string;
  availableQuantity?: string;
  image?: string;
}

export default function ProductForm({
  initialData,
  loading = false,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [unitPrice, setUnitPrice] = useState(initialData?.unit_price || "");
  const [availableQuantity, setAvailableQuantity] = useState(
    initialData?.available_quantity.toString() || "0",
  );
  const [image, setImage] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!unitPrice || Number(unitPrice) <= 0) errs.unitPrice = "Unit price must be greater than 0.";
    if (availableQuantity === "" || Number(availableQuantity) < 0)
      errs.availableQuantity = "Available quantity cannot be negative.";
    if (!isEdit && !image) errs.image = "Product image is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const data = new FormData();
    data.append("title", title);
    data.append("description", description);
    data.append("unit_price", unitPrice);
    data.append("available_quantity", availableQuantity);
    if (image) data.append("image", image);
    await onSubmit(data, initialData?.id);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          error={!!fieldErrors.title}
          fullWidth
          helperText={fieldErrors.title}
          label="Title"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setFieldErrors((p) => ({ ...p, title: undefined }));
          }}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          error={!!fieldErrors.description}
          fullWidth
          helperText={fieldErrors.description}
          label="Description"
          minRows={3}
          multiline
          required
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setFieldErrors((p) => ({ ...p, description: undefined }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          error={!!fieldErrors.unitPrice}
          fullWidth
          helperText={fieldErrors.unitPrice}
          label="Unit price"
          required
          type="number"
          value={unitPrice}
          onChange={(event) => {
            setUnitPrice(event.target.value);
            setFieldErrors((p) => ({ ...p, unitPrice: undefined }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          error={!!fieldErrors.availableQuantity}
          fullWidth
          helperText={fieldErrors.availableQuantity}
          label="Available quantity"
          required
          type="number"
          value={availableQuantity}
          onChange={(event) => {
            setAvailableQuantity(event.target.value);
            setFieldErrors((p) => ({ ...p, availableQuantity: undefined }));
          }}
        />
      </Grid>
      <Grid size={12}>
        <Paper
          variant="outlined"
          sx={{
            borderColor: fieldErrors.image ? "error.main" : "divider",
            borderStyle: "dashed",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Button
              variant="outlined"
              component="label"
              color={fieldErrors.image ? "error" : "primary"}
              onClick={() => setFieldErrors((p) => ({ ...p, image: undefined }))}
            >
              {isEdit ? "Change Image" : "Upload Image *"}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setImage(event.target.files?.[0] || null);
                  setFieldErrors((p) => ({ ...p, image: undefined }));
                }}
              />
            </Button>
            <Stack spacing={0}>
              <Typography
                color={fieldErrors.image ? "error" : "text.secondary"}
                variant="body2"
              >
                {image?.name || (isEdit ? "Upload to replace current image" : "PNG or JPG product image")}
              </Typography>
              {fieldErrors.image && (
                <Typography color="error" variant="caption">
                  {fieldErrors.image}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button disabled={loading} variant="contained" onClick={submit}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
