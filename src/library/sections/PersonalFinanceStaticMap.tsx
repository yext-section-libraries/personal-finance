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
  textStyleToCss,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  Background,
  EntityField,
  MapboxStaticMapComponent,
  MaybeRTF,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveComponentData,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  mapboxStaticMapStyleOptions,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

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

type StaticMapField = {
  apiKey: string;
  coordinate: YextEntityField<CoordinateValue>;
  mapStyle: string;
  zoom: number;
  height?: string;
};

type StaticMapContent = {
  sectionHeading: StyledTextProps;
  sectionDescription: StyledRtfProps;
};

type PersonalFinanceStaticMapProps = {
  section: SectionTheme;
  content: StaticMapContent;
  map: StaticMapField;
};

const typographyScopeClass = "yextPersonalFinanceStaticMapTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const StaticMapFields: YextFields<PersonalFinanceStaticMapProps> = {
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
      sectionHeading: createStyledTextField("Section Heading"),
      sectionDescription: createStyledRtfField("Section Description"),
    },
  },
  map: {
    label: "Map",
    type: "object",
    objectFields: {
      apiKey: {
        type: "text",
        label: "Mapbox API Key",
      },
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
};

export const PersonalFinanceStaticMapComponent: PuckComponent<
  PersonalFinanceStaticMapProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale =
    typeof streamDocument?.locale === "string" ? streamDocument.locale : "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  const mapboxApiKey =
    props.map.apiKey ||
    ((streamDocument?._env as { YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY?: string })
      ?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY ??
      "");
  const mapClassName = `yext-personal-finance-static-map-${props.id}`;
  const sectionDescriptionStyles = {
    ...props.content.sectionDescription.styles,
    color: resolveThemeColor(
      props.content.sectionDescription.fontColor,
      sectionForegroundColor,
    ),
  };
  const resolvedDescription = resolveComponentData(
    props.content.sectionDescription.text,
    locale,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceStaticMap${getAnalyticsScopeHash(props.id)}`}
      >
        <style>{`
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
        `}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={sectionStyle}
        >
          <style>{typographyScopeCss}</style>
          <div className="mx-auto max-w-[1410px] px-6">
            <div className="mx-auto mb-8 max-w-[820px] text-center">
              <EntityField
                displayName="Section Heading"
                fieldId={props.content.sectionHeading.text.field}
                constantValueEnabled={
                  props.content.sectionHeading.text.constantValueEnabled
                }
              >
                <h2
                  className="text-[2.2rem] font-bold tracking-[-0.04em]"
                  style={{
                    color: resolveThemeColor(
                      props.content.sectionHeading.fontColor,
                      sectionForeground,
                    ),
                    ...textStyleToCss(props.content.sectionHeading.styles),
                  }}
                >
                  {resolvePlainText(
                    props.content.sectionHeading.text,
                    locale,
                    streamDocument,
                    "Visit Our Location",
                  )}
                </h2>
              </EntityField>
              <EntityField
                displayName="Section Description"
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
                    richTextStyleOverrides={sectionDescriptionStyles}
                  />
                )}
              </EntityField>
            </div>
            <EntityField
              displayName="Map Location"
              fieldId={props.map.coordinate.field}
              constantValueEnabled={props.map.coordinate.constantValueEnabled}
            >
              <div
                className={`${mapClassName} overflow-hidden rounded-[18px] border border-black/5 bg-white shadow-[0_8px_24px_rgba(9,30,66,0.08)]`}
                style={{ height: props.map.height || "520px" }}
              >
                {mapboxApiKey ? (
                  <MapboxStaticMapComponent
                    coordinate={props.map.coordinate}
                    height="100%"
                    id={`${props.id}-static-map`}
                    mapStyle={props.map.mapStyle}
                    puck={props.puck}
                    zoom={props.map.zoom}
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center px-6 text-center text-sm"
                    style={{ color: "#676767" }}
                  >
                    Add a Mapbox API key to render the static map preview.
                  </div>
                )}
              </div>
            </EntityField>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceStaticMap: YextComponentConfig<PersonalFinanceStaticMapProps> =
  {
    label: "Static Map",
    fields: StaticMapFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Visit Our Location"),
        sectionDescription: createStyledRtfDefault(
          "Use a dedicated location map when you want a simpler geographic reference without the nearby-locations card list.",
        ),
      },
      map: {
        apiKey: "",
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
          constantValueEnabled: false,
        },
        mapStyle: "streets-v12",
        zoom: 13,
        height: "100%",
      },
    },
    render: PersonalFinanceStaticMapComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceStaticMap",
  displayName: "Static Map",
  description: "Static Map",
  pageSetTypes: ["ENTITY"],
};
