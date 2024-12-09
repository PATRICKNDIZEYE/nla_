import { QueryParams } from "@/@types/pagination";
import Log, { Logs } from "@/models/Log";
import { paginate } from "@/utils/helpers/function";

export default class LogService {
  static async create(
    newData: Pick<Logs, "user" | "action" | "target" | "targettype">
  ) {
    const result = await Log.create(newData);

    return result;
  }

  static async getAll(params?: QueryParams) {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);

    const search = params?.search;
    let $or: any[] = [{}];

    if (search) {
      $or = [
        { "user.fullName": { $regex: search, $options: "i" } },
        { "user.nationalId": { $regex: search, $options: "i" } },
        { "user.phoneNumber": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await Log.find({
      $or,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(Math.abs(limit * (page - 1)))
      .limit(limit);

    const count = await Log.countDocuments({
      $or,
    });
    const pagination = paginate(count, limit, page);

    return { data: logs, pagination };
  }
}
