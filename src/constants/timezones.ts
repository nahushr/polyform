/**
 * Complete list of international IANA timezones with current GMT offsets.
 * This is the single source used by calendar events and product availability.
 */
const getAllTimezoneOptions = (): Array<{ value: string; label: string }> => {
  let timezones: string[] = [];
  try {
    const intlObj = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };
    if (typeof intlObj.supportedValuesOf === "function") {
      timezones = intlObj.supportedValuesOf("timeZone");
    }
  } catch {
    // Fallback if Intl.supportedValuesOf is unavailable
  }

  if (!timezones || timezones.length === 0) {
    timezones = [
      "UTC",
      "Africa/Abidjan",
      "Africa/Accra",
      "Africa/Addis_Ababa",
      "Africa/Algiers",
      "Africa/Cairo",
      "Africa/Casablanca",
      "Africa/Johannesburg",
      "Africa/Lagos",
      "Africa/Nairobi",
      "America/Anchorage",
      "America/Argentina/Buenos_Aires",
      "America/Bogota",
      "America/Caracas",
      "America/Chicago",
      "America/Denver",
      "America/Halifax",
      "America/Los_Angeles",
      "America/Mexico_City",
      "America/New_York",
      "America/Phoenix",
      "America/Santiago",
      "America/Sao_Paulo",
      "America/Toronto",
      "America/Vancouver",
      "Asia/Baghdad",
      "Asia/Bangkok",
      "Asia/Colombo",
      "Asia/Dhaka",
      "Asia/Dubai",
      "Asia/Hong_Kong",
      "Asia/Jakarta",
      "Asia/Jerusalem",
      "Asia/Karachi",
      "Asia/Kolkata",
      "Asia/Kuala_Lumpur",
      "Asia/Kuwait",
      "Asia/Manila",
      "Asia/Riyadh",
      "Asia/Seoul",
      "Asia/Shanghai",
      "Asia/Singapore",
      "Asia/Taipei",
      "Asia/Tehran",
      "Asia/Tokyo",
      "Atlantic/Azores",
      "Atlantic/Bermuda",
      "Atlantic/Cape_Verde",
      "Atlantic/Reykjavik",
      "Australia/Adelaide",
      "Australia/Brisbane",
      "Australia/Darwin",
      "Australia/Melbourne",
      "Australia/Perth",
      "Australia/Sydney",
      "Europe/Amsterdam",
      "Europe/Athens",
      "Europe/Belgrade",
      "Europe/Berlin",
      "Europe/Brussels",
      "Europe/Bucharest",
      "Europe/Budapest",
      "Europe/Copenhagen",
      "Europe/Dublin",
      "Europe/Helsinki",
      "Europe/Istanbul",
      "Europe/Lisbon",
      "Europe/London",
      "Europe/Madrid",
      "Europe/Moscow",
      "Europe/Oslo",
      "Europe/Paris",
      "Europe/Prague",
      "Europe/Rome",
      "Europe/Stockholm",
      "Europe/Vienna",
      "Europe/Warsaw",
      "Europe/Zurich",
      "Pacific/Auckland",
      "Pacific/Fiji",
      "Pacific/Guam",
      "Pacific/Honolulu",
      "Pacific/Port_Moresby",
      "Pacific/Tongatapu",
    ];
  }

  if (!timezones.includes("UTC")) {
    timezones.unshift("UTC");
  }

  const now = new Date();
  return timezones.map((tz) => {
    let offsetStr = "";
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      });
      const parts = formatter.formatToParts(now);
      const tzPart = parts.find((p) => p.type === "timeZoneName");
      if (tzPart) {
        offsetStr = ` (${tzPart.value})`;
      }
    } catch {
      // Ignore invalid fallback values.
    }
    return {
      value: tz,
      label: `${tz.replace(/_/g, " ")}${offsetStr}`,
    };
  });
};

export const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> =
  getAllTimezoneOptions();
