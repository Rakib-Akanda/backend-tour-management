
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async (payload: IDivision) => {
  const existingDivision = await Division.findOne({ name: payload.name });
  if (existingDivision) {
    throw new AppError(409, "Exist Division");
  }

  //   const baseSlug = payload.name.toLowerCase().split(" ").join("-");
  //   let slug = `${baseSlug}-division`;
  //   let counter = 0;
  //   while (await Division.exists({ slug })) {
  //     slug = `${slug}-${counter++}`; // dhaka-division-1
  //   }
  //   payload.slug = slug;

  const division = await Division.create(payload);
  return division;
};
const getAllDivision = async () => {
  const divisions = await Division.find({});
  const totalDivisions = await Division.countDocuments();
  return {
    data: divisions,
    meta: {
      total: totalDivisions,
    },
  };
};
const getSingleDivision = async (slug: string) => {
  const division = await Division.findOne({ slug });
  return {
    data: division,
  };
};

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new AppError(404, "Not found division");
  }
  const duplicateDivision = await Division.findOne({
    name: payload.name,
    _id: { $ne: id },
  });
  if (duplicateDivision) {
    throw new AppError(409, "A division with this name already exists.");
  }
  //   if (payload.name) {
  //     const baseSlug = payload.name.toLowerCase().split(" ").join("-");
  //     let slug = `${baseSlug}-division`;
  //     let counter = 0;
  //     while (await Division.exists({ slug })) {
  //       slug = `${slug}-${counter++}`;
  //     }
  //     payload.slug = slug;
  //   }
  const updateDivision = await Division.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
 
  // console.log(payload.thumbnail);

  if (payload.thumbnail && existingDivision.thumbnail) {
    await deleteImageFromCloudinary(existingDivision.thumbnail);
  }

  return updateDivision;
};
const deleteDivision = async (id: string) => {
  const deletedDivision = await Division.findByIdAndDelete(id);
  if (!deletedDivision) {
    throw new AppError(404, "Division Not Found");
  }
  return null;
};

export const DivisionService = {
  createDivision,
  getAllDivision,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
