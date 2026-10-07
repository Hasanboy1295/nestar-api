import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const PROPERTY_TYPES = [
  "APARTMENT",
  "VILLA",
  "HOUSE",
  "LAND",
  "COMMERCIAL",
] as const;
export const PROPERTY_PURPOSES = ["SALE", "RENT"] as const;
export const PROPERTY_STATUSES = ["ACTIVE", "SOLD"] as const;

const PropertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    type: { type: String, enum: PROPERTY_TYPES, default: "APARTMENT" },
    purpose: { type: String, enum: PROPERTY_PURPOSES, default: "SALE" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    city: { type: String, default: "Tashkent", trim: true },
    district: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    beds: { type: Number, default: 1, min: 0 },
    baths: { type: Number, default: 1, min: 0 },
    area: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "", maxlength: 4000 },
    features: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    agentName: { type: String, default: "" },
    agentNick: { type: String, default: "" },
    agentPhone: { type: String, default: "" },
    status: { type: String, enum: PROPERTY_STATUSES, default: "ACTIVE" },
  },
  { timestamps: true, collection: "listings" },
);

export type Property = InferSchemaType<typeof PropertySchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const PropertyModel: Model<Property> =
  (models.Property as Model<Property>) ??
  model<Property>("Property", PropertySchema);

export interface SafeProperty {
  id: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  currency: string;
  city: string;
  district: string;
  address: string;
  beds: number;
  baths: number;
  area: number;
  description: string;
  features: string[];
  isFeatured: boolean;
  views: number;
  agentName: string;
  agentNick: string;
  agentPhone: string;
  status: string;
  createdAt: string;
}

export function safeProperty(property: Property): SafeProperty {
  return {
    id: String(property._id),
    title: property.title,
    type: property.type,
    purpose: property.purpose,
    price: property.price,
    currency: property.currency ?? "USD",
    city: property.city,
    district: property.district ?? "",
    address: property.address ?? "",
    beds: property.beds ?? 0,
    baths: property.baths ?? 0,
    area: property.area ?? 0,
    description: property.description ?? "",
    features: property.features ?? [],
    isFeatured: Boolean(property.isFeatured),
    views: property.views ?? 0,
    agentName: property.agentName ?? "",
    agentNick: property.agentNick ?? "",
    agentPhone: property.agentPhone ?? "",
    status: property.status,
    createdAt: new Date(property.createdAt).toISOString(),
  };
}
