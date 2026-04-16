import { AppError } from "../utils/appError.js";
import {
  buildEmptyDayPlan,
  deleteExactDayActivities,
  fetchResolvedDay,
  getDayGridSummary,
  replaceDayActivities,
} from "../utils/dailyActivityPlanner.js";

export const adminDailyActivitiesService = {
  async getDayGrid() {
    return getDayGridSummary();
  },

  async getDay(dayNumber) {
    const day = await fetchResolvedDay(dayNumber);

    if (day.source === "empty") {
      return {
        source: "empty",
        ...buildEmptyDayPlan(dayNumber),
      };
    }

    return day;
  },

  async saveDay(dayNumber, payload) {
    return replaceDayActivities(dayNumber, payload);
  },

  async deleteDay(dayNumber) {
    const deleted = await deleteExactDayActivities(dayNumber);

    if (!deleted) {
      throw new AppError("No custom daily activity plan exists for this day", 404);
    }

    return {
      day_number: dayNumber,
      message: "Custom daily activity plan deleted successfully",
    };
  },
};
