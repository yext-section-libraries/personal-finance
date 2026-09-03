import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { parsePhoneNumber } from "awesome-phonenumber";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  MapboxStaticMapComponent,
  MaybeRTF,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getPreferredDistanceUnit,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  toKilometers,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  mapboxStaticMapStyleOptions,
  type EntityFieldSelectorField,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import {
  Address,
  AnalyticsScopeProvider,
  HoursStatus,
  Link,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";

type ThemeColorInput = string | ThemeColor | undefined;

const resolveThemeColor = (color?: ThemeColorInput, fallback = "#ffffff") => {
  const selectedColor =
    typeof color === "string" ? color : color?.selectedColor;

  if (!selectedColor) {
    return fallback;
  }

  if (selectedColor.startsWith("#")) {
    return selectedColor;
  }

  if (selectedColor.startsWith("[") && selectedColor.endsWith("]")) {
    return selectedColor.slice(1, -1);
  }

  if (selectedColor === "white" || selectedColor === "black") {
    return selectedColor;
  }

  const paletteTintMatch = selectedColor.match(
    /^palette-(primary|secondary|tertiary|quaternary)-(light|dark)$/,
  );

  if (paletteTintMatch) {
    const [, paletteName, tint] = paletteTintMatch;
    return `hsl(from var(--colors-palette-${paletteName}) h s ${
      tint === "light" ? "98" : "20"
    })`;
  }

  return `var(--colors-${selectedColor})`;
};

type SectionTheme = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type CoordinateValue = {
  latitude: number;
  longitude: number;
};

type NearbyLocationsMap = {
  coordinate: YextEntityField<CoordinateValue>;
  mapStyle: string;
  zoom: number;
};

type NearbyLocationsContent = {
  sectionHeading: StyledTextProps;
  sectionDescription: StyledRtfProps;
};

type NearbyLocationsStyles = {
  cardBackgroundColor?: ThemeColor;
  cardTitleColor?: ThemeColor;
  showHours: boolean;
  showPhone: boolean;
  showAddress: boolean;
  hoursStyles: {
    showCurrentStatus: boolean;
    timeFormat: "12h" | "24h";
    dayOfWeekFormat: "short" | "long";
    showDayNames: boolean;
  };
  phone: {
    phoneFormat: "international" | "domestic";
    includeHyperlink?: boolean;
  };
  address: {
    showRegion: boolean;
    showCountry: boolean;
  };
};

type PersonalFinanceNearbyLocationsProps = {
  section: SectionTheme;
  content: NearbyLocationsContent;
  map: NearbyLocationsMap;
  styles: NearbyLocationsStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass =
  "yextPersonalFinanceNearbyLocationsTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceNearbyLocationsTypographyScope p,
.yextPersonalFinanceNearbyLocationsTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceNearbyLocationsTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceNearbyLocationsTypographyScope a:hover {
  text-decoration: underline;
}
`;

const createEntityText = (
  constantValue: string,
): YextEntityField<TranslatableString> => {
  return {
    field: "",
    constantValue: {
      defaultValue: constantValue,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  };
};

const createEntityRichText = (
  constantValue: string,
): YextEntityField<TranslatableRichText> => {
  return {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(constantValue),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  };
};

const createTextField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.string"],
  };

  return {
    type: "entityField" as const,
    label,
    filter,
  };
};

const createRichTextField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.rich_text_v2"],
  };

  return {
    type: "entityField" as const,
    label,
    filter,
  };
};

const createStyledTextField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
      text: createTextField("Text"),
      styles: {
        label: "Text Styles",
        type: "styledText" as const,
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector" as const,
        options: "SITE_COLOR" as const,
      },
    },
  };
};

const createStyledRtfField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
      text: createRichTextField("Text"),
      styles: {
        label: "Text Styles",
        type: "styledText" as const,
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector" as const,
        options: "SITE_COLOR" as const,
      },
    },
  };
};

const createStyledTextDefault = (
  value: string,
  fontColor?: ThemeColor,
): StyledTextProps => {
  return {
    text: createEntityText(value),
    styles: defaultTextStyle,
    fontColor,
  };
};

const createStyledRtfDefault = (
  value: string,
  fontColor?: ThemeColor,
): StyledRtfProps => {
  return {
    text: createEntityRichText(value),
    styles: defaultTextStyle,
    fontColor,
  };
};

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const resolvePlainText = (
  value: TranslatableString | YextEntityField<TranslatableString> | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
  fallback = "",
): string => {
  if (!value) {
    return fallback;
  }

  const resolved = resolveComponentData(
    value as never,
    locale,
    streamDocument,
    {
      output: "plainText",
    },
  );

  if (typeof resolved === "string") {
    return resolved;
  }

  if (resolved && typeof resolved === "object" && "defaultValue" in resolved) {
    const defaultValue = (resolved as { defaultValue?: unknown }).defaultValue;
    return typeof defaultValue === "string" ? defaultValue : fallback;
  }

  return fallback;
};

const normalizeResolvedRichText = (
  value: string | React.ReactElement | TranslatableRichText | undefined,
): string | ReturnType<typeof getDefaultRTF> | undefined => {
  if (!value || typeof value === "string" || React.isValidElement(value)) {
    return typeof value === "string" ? value : undefined;
  }

  if ("defaultValue" in value) {
    return value.defaultValue;
  }

  return value as ReturnType<typeof getDefaultRTF>;
};

const textStyleToCss = (
  styles?: Partial<StyledTextValue>,
  fontColor?: string | ThemeColor,
  fallbackColor?: string,
): React.CSSProperties => {
  return {
    fontFamily: isDefaultToken(styles?.fontFamily)
      ? undefined
      : styles?.fontFamily,
    fontSize: isDefaultToken(styles?.fontSize) ? undefined : styles?.fontSize,
    fontWeight: isDefaultToken(styles?.fontWeight)
      ? undefined
      : styles?.fontWeight,
    fontStyle: isDefaultToken(styles?.fontStyle)
      ? undefined
      : styles?.fontStyle,
    textTransform: isDefaultToken(styles?.textTransform)
      ? undefined
      : styles?.textTransform,
    color: resolveThemeColor(fontColor, fallbackColor),
  };
};

const formatPhoneNumber = (
  phoneNumberString: string,
  format: "international" | "domestic" = "domestic",
): string => {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );

  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);
  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
};

const calculateDistanceMiles = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
};

const formatDistance = (
  currentCoordinate: CoordinateValue | undefined,
  nearbyCoordinate: CoordinateValue | undefined,
  locale: string,
) => {
  if (
    currentCoordinate?.latitude === undefined ||
    currentCoordinate.longitude === undefined ||
    nearbyCoordinate?.latitude === undefined ||
    nearbyCoordinate.longitude === undefined
  ) {
    return "";
  }

  const distanceMiles = calculateDistanceMiles(
    currentCoordinate.latitude,
    currentCoordinate.longitude,
    nearbyCoordinate.latitude,
    nearbyCoordinate.longitude,
  );
  const preferredUnit = getPreferredDistanceUnit(locale);

  if (preferredUnit === "kilometer") {
    return `${toKilometers(distanceMiles).toFixed(1)} km away`;
  }

  return `${distanceMiles.toFixed(1)} miles away`;
};

const SectionFields: YextFields<PersonalFinanceNearbyLocationsProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  content: {
    label: "Content",
    type: "object",
    objectFields: {
      sectionHeading: createStyledTextField("Heading"),
      sectionDescription: createStyledRtfField("Description"),
    },
  },
  map: {
    label: "Map",
    type: "object",
    objectFields: {
      coordinate: {
        type: "entityField",
        label: "Coordinates",
        filter: { types: ["type.coordinate"] },
      },
      mapStyle: {
        label: "Mapbox Map Style",
        type: "select",
        options: mapboxStaticMapStyleOptions,
      },
      zoom: {
        label: "Zoom",
        type: "number",
        min: 0,
        max: 22,
      },
    },
  },
  styles: {
    label: "Style",
    type: "object",
    objectFields: {
      cardBackgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      cardTitleColor: {
        label: "Title Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      showHours: {
        label: "Show Hours",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showPhone: {
        label: "Show Phone",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showAddress: {
        label: "Show Address",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      hoursStyles: {
        label: "Hours Styles",
        type: "object",
        objectFields: {
          showCurrentStatus: {
            label: "Show Current Status",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          timeFormat: {
            label: "Time Format",
            type: "select",
            options: [
              { label: "12 Hour", value: "12h" },
              { label: "24 Hour", value: "24h" },
            ],
          },
          dayOfWeekFormat: {
            label: "Day Of Week Format",
            type: "select",
            options: [
              { label: "Short", value: "short" },
              { label: "Long", value: "long" },
            ],
          },
          showDayNames: {
            label: "Show Day Names",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      phone: {
        label: "Phone",
        type: "object",
        objectFields: {
          phoneFormat: {
            label: "Phone Number Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Phone Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      address: {
        label: "Address",
        type: "object",
        objectFields: {
          showRegion: {
            label: "Show Region",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showCountry: {
            label: "Show Country",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
    },
  },
};

export const PersonalFinanceNearbyLocationsComponent: PuckComponent<
  PersonalFinanceNearbyLocationsProps
> = (props) => {
  const streamDocument = useDocument() as StreamDocument;
  const locale =
    typeof streamDocument?.locale === "string" ? streamDocument.locale : "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const currentCoordinate = streamDocument?.yextDisplayCoordinate as
    CoordinateValue | undefined;
  const enableNearbyLocations =
    currentCoordinate?.latitude !== undefined &&
    currentCoordinate?.longitude !== undefined;
  const { data: nearbyLocationsData, status: nearbyLocationsStatus } =
    useNearbyLocations({
      streamDocument,
      latitude: currentCoordinate?.latitude,
      longitude: currentCoordinate?.longitude,
      radiusMi: 10,
      limit: 3,
      enabled: enableNearbyLocations,
    });
  const nearbyLocationDocs = nearbyLocationsData?.response?.docs ?? [];
  const nearbyLocationCards = nearbyLocationDocs.map((locationData) => ({
    locationData,
    resolvedUrl: resolveUrlTemplate(
      mergeMeta(locationData, streamDocument),
      relativePrefixToRoot ?? "",
    ),
  }));
  const mapCoordinate: YextEntityField<CoordinateValue> = {
    field: "yextDisplayCoordinate",
    constantValue: {
      latitude: 0,
      longitude: 0,
    },
    constantValueEnabled: false,
  };
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const sectionForegroundColor = resolveThemeColor(
    sectionForeground,
    "#1a1a1a",
  );
  let mapboxApiKey = streamDocument?._env?.YEXT_MAPBOX_API_KEY;
  if (
    typeof document !== "undefined" &&
    window.frameElement instanceof HTMLIFrameElement &&
    window.frameElement.contentDocument &&
    streamDocument?._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY
  ) {
    mapboxApiKey = streamDocument._env.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
  }
  const cardBackgroundColor = resolveThemeColor(
    props.styles.cardBackgroundColor,
    "#f2f2f4",
  );
  const cardTitleColor = resolveThemeColor(
    props.styles.cardTitleColor,
    resolveThemeColor(
      props.styles.cardBackgroundColor?.contrastingColor,
      sectionForegroundColor,
    ),
  );
  const cardForegroundColor = resolveThemeColor(
    props.styles.cardBackgroundColor?.contrastingColor,
    sectionForegroundColor,
  );
  const resolvedDescription = resolveComponentData(
    props.content.sectionDescription.text as never,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: {
        ...props.content.sectionDescription.styles,
        color: resolveThemeColor(
          props.content.sectionDescription.fontColor,
          sectionForegroundColor,
        ),
      },
    },
  );
  const mapClassName = `nearby-map-${props.id}`;

  const renderCardsContent = () => {
    if (nearbyLocationsStatus === "pending") {
      return (
        <div className="rounded-[14px] border border-black/5 bg-white/60 p-6 text-sm text-[#676767]">
          Loading nearby locations
        </div>
      );
    }

    if (
      nearbyLocationsStatus !== "success" ||
      !nearbyLocationCards.length ||
      !enableNearbyLocations
    ) {
      if (!props.puck.isEditing) {
        return null;
      }

      return (
        <div className="rounded-[14px] border border-black/5 bg-white/60 p-6 text-sm text-[#676767]">
          No nearby locations found for this location
        </div>
      );
    }

    return nearbyLocationCards.map(({ locationData, resolvedUrl }) => {
      const phoneNumber = locationData.mainPhone?.trim() ?? "";
      const nearbyHours = locationData.hours as HoursType | undefined;
      const nearbyTimezone =
        typeof locationData.timezone === "string"
          ? locationData.timezone
          : undefined;
      const distanceText = formatDistance(
        currentCoordinate,
        (locationData.yextDisplayCoordinate ??
          locationData.geocodedCoordinate) as CoordinateValue | undefined,
        locale,
      );

      return (
        <article
          key={locationData.id ?? locationData.name}
          className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-black/5 p-6"
          style={{ backgroundColor: cardBackgroundColor }}
        >
          <a
            href={resolvedUrl}
            className="text-[1.05rem] font-semibold"
            style={{ color: cardTitleColor }}
          >
            {locationData.name || "Nearby Location"}
          </a>
          {props.styles.showAddress && locationData.address ? (
            <div
              className="text-sm leading-6"
              style={{ color: cardForegroundColor }}
            >
              <Address
                address={locationData.address}
                showRegion={props.styles.address.showRegion}
                showCountry={props.styles.address.showCountry}
              />
            </div>
          ) : null}
          {props.styles.showHours && nearbyHours && nearbyTimezone ? (
            <div
              className="text-sm leading-6"
              style={{ color: cardForegroundColor }}
            >
              <HoursStatus
                hours={nearbyHours}
                timezone={nearbyTimezone}
                dayOptions={{
                  weekday: props.styles.hoursStyles.dayOfWeekFormat,
                }}
                timeOptions={{
                  hour12: props.styles.hoursStyles.timeFormat === "12h",
                }}
                statusTemplate={(params: StatusParams) => {
                  const interval = params.isOpen
                    ? params.currentInterval
                    : params.futureInterval;
                  const time = params.isOpen
                    ? (interval?.getEndTime(locale, params.timeOptions) ?? "")
                    : (interval?.getStartTime(locale, params.timeOptions) ??
                      "");
                  const showDayOfWeek =
                    props.styles.hoursStyles.showDayNames &&
                    Boolean(interval) &&
                    Boolean(time);
                  const dayOfWeek = showDayOfWeek
                    ? params.isOpen
                      ? (interval?.end
                          ?.setLocale(locale)
                          .toLocaleString(params.dayOptions) ?? "")
                      : (interval?.start
                          ?.setLocale(locale)
                          .toLocaleString(params.dayOptions) ?? "")
                    : "";
                  const futureText = !time
                    ? ""
                    : params.isOpen
                      ? dayOfWeek
                        ? `Closes at ${time} ${dayOfWeek}`
                        : `Closes at ${time}`
                      : dayOfWeek
                        ? `Opens at ${time} ${dayOfWeek}`
                        : `Opens at ${time}`;

                  return (
                    <div>
                      {props.styles.hoursStyles.showCurrentStatus ? (
                        <span>{params.isOpen ? "Open Now" : "Closed"}</span>
                      ) : null}
                      {props.styles.hoursStyles.showCurrentStatus &&
                      futureText ? (
                        <span aria-hidden="true"> • </span>
                      ) : null}
                      {futureText ? <span>{futureText}</span> : null}
                    </div>
                  );
                }}
              />
            </div>
          ) : null}
          {props.styles.showPhone && phoneNumber ? (
            !props.styles.phone.includeHyperlink ? (
              <p
                className="text-sm leading-6"
                style={{ color: cardForegroundColor }}
              >
                {formatPhoneNumber(phoneNumber, props.styles.phone.phoneFormat)}
              </p>
            ) : (
              <Link
                cta={{
                  link: phoneNumber.replace(/\D/g, ""),
                  linkType: "PHONE",
                }}
                style={{ color: cardForegroundColor }}
              >
                {formatPhoneNumber(phoneNumber, props.styles.phone.phoneFormat)}
              </Link>
            )
          ) : null}
          {distanceText ? (
            <p
              className="text-sm leading-6"
              style={{ color: cardForegroundColor }}
            >
              {distanceText}
            </p>
          ) : null}
          <a
            href={resolvedUrl}
            className="pt-1 text-sm font-medium"
            style={{ color: cardForegroundColor }}
          >
            View location
          </a>
        </article>
      );
    });
  };

  if (
    !props.puck.isEditing &&
    (nearbyLocationsStatus === "error" ||
      (!enableNearbyLocations && nearbyLocationsStatus !== "pending") ||
      (nearbyLocationsStatus === "success" && nearbyLocationCards.length === 0))
  ) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceNearbyLocations${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          id="nearby-locations"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={{
            backgroundColor: resolveThemeColor(
              props.section.backgroundColor,
              "#ffffff",
            ),
          }}
        >
          <style>{typographyScopeCss}</style>
          <style>
            {`
.${mapClassName} .mapbox-static-map-shell,
.${mapClassName} .mapbox-static-map-picture,
.${mapClassName} .mapbox-static-map-image {
  height: 100%;
  width: 100%;
}
.${mapClassName} .mapbox-static-map-image {
  object-fit: cover;
  object-position: center;
}
`}
          </style>
          <div className="mx-auto max-w-[1410px] px-6">
            <div className="mx-auto mb-8 max-w-[980px] text-center">
              <EntityField
                displayName="Heading"
                fieldId={props.content.sectionHeading.text.field}
                constantValueEnabled={
                  props.content.sectionHeading.text.constantValueEnabled
                }
              >
                <h2
                  className="text-[2.2rem] font-bold tracking-[-0.04em]"
                  style={textStyleToCss(
                    props.content.sectionHeading.styles,
                    props.content.sectionHeading.fontColor,
                    sectionForegroundColor,
                  )}
                >
                  {resolvePlainText(
                    props.content.sectionHeading.text,
                    locale,
                    streamDocument,
                    "Nearby Locations",
                  )}
                </h2>
              </EntityField>
              <EntityField
                displayName="Description"
                fieldId={props.content.sectionDescription.text.field}
                constantValueEnabled={
                  props.content.sectionDescription.text.constantValueEnabled
                }
              >
                {React.isValidElement(resolvedDescription) ? (
                  resolvedDescription
                ) : (
                  <MaybeRTF
                    data={normalizeResolvedRichText(resolvedDescription)}
                    className="mt-3 text-sm leading-7"
                    richTextStyleOverrides={{
                      ...props.content.sectionDescription.styles,
                      color: resolveThemeColor(
                        props.content.sectionDescription.fontColor,
                        sectionForegroundColor,
                      ),
                    }}
                  />
                )}
              </EntityField>
            </div>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)] lg:items-stretch">
              <EntityField
                displayName="Map Location"
                fieldId={props.map.coordinate.field}
                constantValueEnabled={props.map.coordinate.constantValueEnabled}
              >
                <div
                  className={`${mapClassName} h-full min-h-[420px] overflow-hidden rounded-[16px] border border-black/5 bg-white shadow-[0_6px_22px_rgba(9,30,66,0.08)]`}
                >
                  {mapboxApiKey ? (
                    <MapboxStaticMapComponent
                      coordinate={mapCoordinate}
                      height="100%"
                      id={`${props.id}-map`}
                      mapStyle={props.map.mapStyle}
                      puck={props.puck}
                      zoom={props.map.zoom}
                    />
                  ) : (
                    <div className="flex h-full min-h-[420px] items-center justify-center px-6 text-center text-sm text-[#676767]">
                      Add a Mapbox API key via{" "}
                      <code>YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY</code> or{" "}
                      <code>YEXT_MAPBOX_API_KEY</code> to render the map.
                    </div>
                  )}
                </div>
              </EntityField>
              <div className="grid gap-5">{renderCardsContent()}</div>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceNearbyLocations: YextComponentConfig<PersonalFinanceNearbyLocationsProps> =
  {
    label: "Nearby Locations",
    fields: SectionFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Nearby Locations"),
        sectionDescription: createStyledRtfDefault(
          "Explore nearby [[address.city]]-area offices for wealth management, retirement planning, and advisory conversations.",
        ),
      },
      map: {
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        },
        mapStyle: "streets-v12",
        zoom: 12,
      },
      styles: {
        cardBackgroundColor: {
          selectedColor: "[#f2f2f4]",
          contrastingColor: "black",
        },
        showHours: true,
        showPhone: true,
        showAddress: true,
        hoursStyles: {
          showCurrentStatus: true,
          timeFormat: "12h",
          dayOfWeekFormat: "long",
          showDayNames: true,
        },
        phone: {
          phoneFormat: "domestic",
          includeHyperlink: true,
        },
        address: {
          showRegion: true,
          showCountry: false,
        },
      },
    },
    render: PersonalFinanceNearbyLocationsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceNearbyLocations",
  displayName: "Nearby Locations",
  description: "Nearby Locations",
  pageSetTypes: ["ENTITY"],
};
