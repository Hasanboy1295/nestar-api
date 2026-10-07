import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const MEMBER_TYPES = ["USER", "ADMIN"] as const;
export const MEMBER_STATUSES = ["ACTIVE", "BLOCKED"] as const;
export const MEMBER_AUTH_TYPES = ["EMAIL", "SSO"] as const;

const MemberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MEMBER_TYPES,
      default: "USER",
    },
    memberStatus: {
      type: String,
      enum: MEMBER_STATUSES,
      default: "ACTIVE",
    },
    memberAuthType: {
      type: String,
      enum: MEMBER_AUTH_TYPES,
      default: "EMAIL",
    },
    memberNick: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    memberEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    memberPassword: {
      type: String,
      required: true,
      select: false,
    },
    memberFullName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    memberImage: {
      type: String,
      default: "",
    },
    memberDesc: {
      type: String,
      default: "",
      maxlength: 500,
    },
    memberPoints: {
      type: Number,
      default: 0,
    },
    memberFavorites: {
      type: [Schema.Types.ObjectId],
      ref: "Property",
      default: [],
    },
  },
  { timestamps: true, collection: "members" },
);

export type Member = InferSchemaType<typeof MemberSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const MemberModel: Model<Member> =
  (models.Member as Model<Member>) ?? model<Member>("Member", MemberSchema);

export interface SafeMember {
  id: string;
  memberNick: string;
  memberEmail: string;
  memberFullName: string;
  memberImage: string;
  memberDesc: string;
  memberType: string;
  memberStatus: string;
  memberAuthType: string;
  memberPoints: number;
  createdAt: string;
}

export function safeMember(member: Member): SafeMember {
  return {
    id: String(member._id),
    memberNick: member.memberNick,
    memberEmail: member.memberEmail,
    memberFullName: member.memberFullName ?? "",
    memberImage: member.memberImage ?? "",
    memberDesc: member.memberDesc ?? "",
    memberType: member.memberType,
    memberStatus: member.memberStatus,
    memberAuthType: member.memberAuthType,
    memberPoints: member.memberPoints ?? 0,
    createdAt: new Date(member.createdAt).toISOString(),
  };
}
