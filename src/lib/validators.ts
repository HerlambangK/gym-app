import { z } from "zod";

export const registerMemberSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(9),
  planCode: z.string().min(2),
});

export const attendanceLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().max(150),
});

