import { Booking } from "@/domain/work/enterprise/booking";

export class BookingPresenter {
  static toHTTP(booking: Booking, storageUrl: string) {
    return {
      id: booking.id.toString(),
      image1: booking.image1 && booking.image1 != "null" ? storageUrl + booking.image1 : null,
      image2: booking.image2 && booking.image2 != "null" ? storageUrl + booking.image2 : null,
      image3: booking.image3 && booking.image3 != "null" ? storageUrl + booking.image3 : null,
      image4: booking.image4 && booking.image4 != "null" ? storageUrl + booking.image4 : null,
      image5: booking.image5 && booking.image5 != "null" ? storageUrl + booking.image5 : null,
      image6: booking.image6 && booking.image6 != "null" ? storageUrl + booking.image6 : null,
      title: booking.title,
      final_price: booking.finalPrice,
      work_state: booking.workState,
      state: booking.state,
      request_work_state: booking.requestWorkState,
      category: booking.category,
      category_id: booking.categoryId?.toString(),
      sub_category: booking.subCategory,
      sub_category_id: booking.subCategoryId?.toString(),
      sub_sub_category: booking.subSubCategory,
      sub_sub_category_id: booking.subSubCategoryId?.toString(),
      service: booking.service,
      service_id: booking.serviceId?.toString(),
      work_date: booking.workDate,
      has_started_dispute: booking.hasStartedDispute,
      address: {
        id: booking.address?.id.toString(),
        line1: booking.address?.line1,
        line2: booking.address?.line2,
        longitude: booking.address?.longitude,
        latitude: booking.address?.latitude,
      },
      client: {
        id: booking.client?.id.toString(),
        name: booking.client?.name,
        profile_url: booking.client?.profileUrl ? storageUrl + booking.client?.profileUrl : null,
        rating: booking.client?.rating
      },
      service_provider: {
        id: booking.serviceProvider?.id?.toString(),
        name: booking.serviceProvider?.name,
        profile_url: booking.serviceProvider?.profileUrl ? storageUrl + booking.serviceProvider?.profileUrl : null,
        rating: booking.serviceProvider?.rating,
        is_favorite: booking.serviceProvider?.isFavorite
      },
      conversation_id: booking.conversationId.toString(),
      description: booking.description,
      answers: booking.answers,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt,
      total_trying_to_start: booking.totalTryingToStart,
      total_trying_to_finish: booking.totalTryingToFinish,
      client_send_review: booking.clientSendReview,
      service_provider_send_review: booking.serviceProviderSendReview,
      completed_at: booking.completedAt,
      client_review: booking.clientReview,
      service_provider_review: booking.serviceProviderReview
    };
  }
}