import z from "zod";
import { Guide_Status } from "./guide.interface";

export const createGuideZodSchema = z.object({
  userId: z.string({ invalid_type_error: "userId must be a string" }),
  divisionId: z.string({ invalid_type_error: "divisionId must be a string" }),
  nidPhoto: z.string({ invalid_type_error: "nidPhoto must be a string" }),
  status: z.enum(Object.values(Guide_Status) as [string]).optional(),
});
export const updateGuideZodSchema = z.object({
  //   userId: z.string().optional(), // userId update kora jabe nah but nid and divisionId and others updatable, Karon userId Change hole eta kun user tar information ba integrity thakbe nah;
  divisionId: z
    .string({ invalid_type_error: "divisionId must be a string" })
    .optional(),
  nidPhoto: z
    .string({ invalid_type_error: "divisionId must be a string" })
    .optional(),
  status: z.enum([Guide_Status.APPROVED, Guide_Status.REJECTED] as [
    string,
    string,
  ]),
});
