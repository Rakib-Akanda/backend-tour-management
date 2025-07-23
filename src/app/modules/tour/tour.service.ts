import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new AppError(409, "A tour with this title already exists.");
  }

  const tour = await Tour.create(payload);
  return tour;
};

const getAllTours = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);
  const tours = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();
  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};
const getSingleTour = async (slug: string) => {
  const tour = await Tour.findOne({ slug });
  return {
    data: tour,
  };
};
const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new AppError(404, "Tour not found");
  }

  if (
    payload.images &&
    payload.images.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    payload.images = [...payload.images, ...existingTour.images];
  }

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    const restDBImages = existingTour.images.filter(
      (imageUrl) => !payload.deleteImages?.includes(imageUrl)
    );
    const updatedPayloadImages = (payload.images || [])
      .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
      .filter((imageUrl) => !restDBImages.includes(imageUrl));

    payload.images = [...restDBImages, ...updatedPayloadImages];
  }
  const updateTour = await Tour.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    await Promise.all(payload.deleteImages.map((url) => deleteImageFromCloudinary(url)));
  }
  return updateTour;
};
const deleteTour = async (id: string) => {
  return await Tour.findByIdAndDelete(id);
};

// -------------Tour Types----------------//
const createTourType = async (payload: ITourType) => {
  if (!payload.name) {
    throw new Error("Tour type name is required.");
  }
  const existingTourType = await TourType.findOne({ name: payload.name });
  if (existingTourType) {
    throw new Error("Tour type already exists.");
  }
  const newTourType = await TourType.create({ name: payload.name }); // problem
  return newTourType;
};

const getAllTourTypes = async () => {
  // console.log("from services");
  const allTourTypes = await TourType.find();
  return allTourTypes;
};

const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }
  const updatedTourType = await TourType.findByIdAndUpdate(
    id,
    { name: payload },
    {
      new: true,
      runValidators: true,
    }
  );
  return updatedTourType;
};

const deleteTourType = async (id: string) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }
  return await TourType.findByIdAndDelete(id);
};
const getSingleTourType = async (id: string) => {
  const tourType = await TourType.findById(id);
  return {
    data: tourType,
  };
};

export const TourService = {
  createTour,
  getAllTours,
  getSingleTour,
  updateTour,
  deleteTour,
  createTourType,
  getAllTourTypes,
  updateTourType,
  deleteTourType,
  getSingleTourType,
};
