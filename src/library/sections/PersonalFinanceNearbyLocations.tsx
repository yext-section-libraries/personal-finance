import type { SectionConfig } from "@yext/visual-editor";

import {
  createStyledRtfDefault,
  createStyledRtfField,
  createStyledTextDefault,
  createStyledTextField,
  getScopedTypographyCss,
  normalizeResolvedRichText,
  resolvePlainText,
  resolveThemeColor,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  Background,
  EntityField,
  MapboxStaticMapComponent,
  MaybeRTF,
  getAnalyticsScopeHash,
  getPreferredDistanceUnit,
  getSurfaceColorStyle,
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
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import {
  Address,
  AnalyticsScopeProvider,
  HoursStatus,
  Link,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";

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

const typographyScopeClass =
  "yextPersonalFinanceNearbyLocationsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
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
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  let mapboxApiKey = streamDocument?._env?.YEXT_MAPBOX_API_KEY;
  if (
    typeof document !== "undefined" &&
    window.frameElement instanceof HTMLIFrameElement &&
    window.frameElement.contentDocument &&
    streamDocument?._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY
  ) {
    mapboxApiKey = streamDocument._env.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
  }
  const cardStyle = getSurfaceColorStyle(
    props.styles.cardBackgroundColor,
    streamDocument,
  );
  const cardTitleColor = resolveThemeColor(
    props.styles.cardTitleColor,
    cardStyle?.color ?? sectionForegroundColor,
  );
  const cardForegroundColor = cardStyle?.color ?? sectionForegroundColor;
  const resolvedDescription = resolveComponentData(
    props.content.sectionDescription.text as never,
    locale,
    streamDocument,
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
        <Background
          as="div"
          background={props.styles.cardBackgroundColor}
          key={locationData.id ?? locationData.name}
          className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-black/5 p-6"
          style={cardStyle}
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
        </Background>
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
        <Background
          as="section"
          background={props.section.backgroundColor}
          id="nearby-locations"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={sectionStyle}
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
        </Background>
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
