import { Booking } from "@/domain/work/enterprise";

export function isBookingRelatedToUser({
  booking,
  clientOrSpId,
  accountType,
}: {
  booking: Booking,
  clientOrSpId: string,
  accountType: string
}): boolean {
  if (
    (
      accountType === "Client" &&
      booking.clientId.toString() === clientOrSpId
    ) ||
    (
      accountType === "ServiceProvider" &&
      booking.serviceProviderId.toString() === clientOrSpId
    )
  ) return true;

  return false;
}