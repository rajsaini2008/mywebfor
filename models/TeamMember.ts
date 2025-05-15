import mongoose, { Schema, models } from "mongoose";

const teamMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// If the model is already defined, use that, otherwise create a new one
const TeamMember = models.TeamMember || mongoose.model("TeamMember", teamMemberSchema);
export default TeamMember; 