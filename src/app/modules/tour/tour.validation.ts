import z from "zod";

export const createTourZodSchema = z.object({
  title: z.string(),
  //   slug: z.string().optional(),
  description: z.string().optional(),
  //   images: z.array(z.string()).optional(),
  location: z.string().optional(),
  costFrom: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  inCluded: z.array(z.string()).optional(),
  exCluded: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  tourPlan: z.array(z.string()).optional(),
  maxGuests: z.number().optional(),
  minAge: z.number().optional(),
  division: z.string(),
  tourType: z.string(),
  departureLocation: z.string().optional(),
  arrivalLocation: z.string().optional(),
});
export const updateTourZodSchema = z.object({
  title: z.string().optional(),
  //   slug: z.string().optional(),
  description: z.string().optional(),
  //   images: z.array(z.string()).optional(),
  location: z.string().optional(),
  costFrom: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  inCluded: z.array(z.string()).optional(),
  exCluded: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  tourPlan: z.array(z.string()).optional(),
  maxGuests: z.number().optional(),
  minAge: z.number().optional(),
  division: z.string().optional(),
  tourType: z.string().optional(),
  departureLocation: z.string().optional(),
  arrivalLocation: z.string().optional(),
  deleteImages: z.array(z.string()).optional(),
});

export const createTourTypeZodSchema = z.object({
  name: z.string(),
});
