import { Activity } from "@/domain/users/enterprise/activity";

export class ActivityPresenter {
  static toHTTP(activity: Activity) {
    return {
      id: activity.id.toString(),
      activity: activity.activity,
      created_at: activity.createdAt,
    };
  }
}