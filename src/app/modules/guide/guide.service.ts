import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Guide_Status, IGuide } from "./guide.interface";
import { Guide } from "./guide.model";
import { Division } from "../division/division.model";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { guideSearchableFields } from "./guide.constant";

const createGuide = async (payload: IGuide) => {
  const existingGuidePromise = Guide.findOne({ userId: payload.userId });
  const userPromise = User.findById({ _id: payload.userId }).select(
    "-password"
  );
  const divisionPromise = Division.findById({ _id: payload.divisionId });
  const [existingGuide, user, division] = await Promise.all([
    existingGuidePromise,
    userPromise,
    divisionPromise,
  ]);
  if (existingGuide) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Guid Already Exist with this UserId"
    );
  }
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User Id not found");
  }
  if (!division) {
    throw new AppError(StatusCodes.NOT_FOUND, "Division Id not found");
  }
  const guidePayload = {
    ...payload,
    name: user.name,
    email: user.email,
    divisionName: division.name,
  };
  const guide = await Guide.create(guidePayload);
  return guide;
};
const approveGuide = async (id: string, payload: Partial<IGuide>) => {
  const session = await Guide.startSession();
  session.startTransaction();
  try {
    const guide = await Guide.findById(id);
    if (!guide) {
      throw new AppError(StatusCodes.NOT_FOUND, "Guide Not Found");
    }
    if (
      guide.status === payload.status ||
      guide.divisionId === payload.divisionId ||
      guide.nidPhoto === payload.nidPhoto
    ) {
      throw new AppError(StatusCodes.CONFLICT, "Please Provide Different Data");
    }
    const approvedGuide = await Guide.findByIdAndUpdate(
      id,
      {
        divisionId: payload.divisionId,
        nidPhoto: payload.nidPhoto,
        status: payload.status,
      },
      { new: true, runValidators: true, session }
    );
    //  update User Role
    if (payload.status === Guide_Status.APPROVED) {
      const user = await User.findByIdAndUpdate(
        { _id: guide.userId },
        {
          role: Role.GUIDE,
        },
        { new: true, runValidators: true, session }
      ).select("_id email name role ");
      // console.log(user);
      return {
        approvedGuide,
        user,
      };
    }
    await session.commitTransaction();
    session.endSession();
    return approvedGuide;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const getGuide = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Guide.find(), query);
  const guides = await queryBuilder
    .search(guideSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    guides.build(),
    queryBuilder.getMeta(),
  ]);
  return { data, meta };
};
const getSingleGuide = async (id: string) => {
  const guide = await Guide.findById(id);
  return guide;
};

export const GuideServices = {
  createGuide,
  approveGuide,
  getGuide,
  getSingleGuide,
};
