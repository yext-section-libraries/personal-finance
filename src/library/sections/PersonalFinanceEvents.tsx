import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  TimestampAtom,
  TimestampOption,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  resolveComponentData,
  resolveLocalizedAssetImage,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type ComprehensiveCTAValue,
  type EntityFieldSelectorField,
  type StyledButtonValue,
  type StyledImageValue,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextCTAField,
  type YextEntityField,
} from "@yext/visual-editor";
import {
  AnalyticsScopeProvider,
  type ComplexImageType,
  type ImageType,
} from "@yext/pages-components";
import type { CSSProperties } from "react";

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

const hasImageSource = (
  image: ImageType | ComplexImageType | TranslatableAssetImage | undefined,
): boolean => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string" && image.url.trim()) {
    return true;
  }

  if (
    "image" in image &&
    image.image &&
    typeof image.image === "object" &&
    "url" in image.image &&
    typeof image.image.url === "string" &&
    image.image.url.trim()
  ) {
    return true;
  }

  return false;
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

type CardImageProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type TimestampFieldProps = {
  date: YextEntityField<string>;
  endDate: YextEntityField<string>;
  includeTime: boolean;
  includeRange: boolean;
};

type EventCard = {
  image: YextEntityField<TranslatableAssetImage>;
  name: YextEntityField<TranslatableString>;
  eventTime: Pick<TimestampFieldProps, "date" | "endDate">;
  description: YextEntityField<TranslatableRichText>;
  cta: unknown;
};

type EventsContent = {
  sectionHeading: StyledTextProps;
  sectionDescription: StyledRtfProps;
  events: typeof eventSource.value;
};

type EventsStyles = {
  cardBackgroundColor: ThemeColor;
  image: Omit<CardImageProps, "image">;
  name: Omit<StyledTextProps, "text">;
  eventTime: Pick<TimestampFieldProps, "includeTime" | "includeRange">;
  description: Omit<StyledRtfProps, "text">;
};

type PersonalFinanceEventsProps = {
  section: SectionTheme;
  content: EventsContent;
  styles: EventsStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceEventsTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceEventsTypographyScope p,
.yextPersonalFinanceEventsTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceEventsTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceEventsTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceEventsTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceEventsTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceEventsTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceEventsTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceEventsTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceEventsTypographyScope a:hover {
  text-decoration: underline;
}
`;

const defaultButtonStyle: StyledButtonValue = {
  ...defaultTextStyle,
  borderRadius: "default",
  letterSpacing: "default",
};

const defaultImageStyle: StyledImageValue = {
  borderRadius: "default",
};

const defaultImages = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
];

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

const createImageField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.image"],
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

const createImageStyleField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
      aspectRatio: {
        type: "basicSelector" as const,
        label: "Aspect Ratio",
        options: "ASPECT_RATIO" as const,
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select" as const,
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
      styles: {
        label: "Image Styles",
        type: "styledImage" as const,
      },
    },
  };
};

const createTimestampDataField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.datetime"],
  };

  return {
    label,
    type: "object" as const,
    objectFields: {
      date: {
        type: "entityField" as const,
        label: "Date",
        filter,
      },
      endDate: {
        type: "entityField" as const,
        label: "End Date",
        filter,
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

const createDefaultImageValue = (
  url: string,
  alternateText: string,
): YextEntityField<TranslatableAssetImage> => ({
  field: "",
  constantValue: {
    url,
    width: 1200,
    height: 800,
    alternateText,
  },
  constantValueEnabled: true,
});

const createDefaultTimestamp = (
  date: string,
  endDate = "",
): Pick<TimestampFieldProps, "date" | "endDate"> => {
  return {
    date: {
      field: "",
      constantValue: date,
      constantValueEnabled: true,
    },
    endDate: {
      field: "",
      constantValue: endDate,
      constantValueEnabled: true,
    },
  };
};

const createDefaultCta = (label: string, link = "#"): ComprehensiveCTAValue => {
  const ctaField: YextCTAField = {
    field: "",
    constantValue: {
      label,
      link,
      linkType: "URL",
    },
    constantValueEnabled: true,
    selectedType: "textAndLink",
  };

  return {
    data: {
      actionType: "link" as const,
      cta: ctaField,
      openInNewTab: false,
    },
    styles: {
      variant: "primary" as const,
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      button: {
        ...defaultButtonStyle,
        fontSize: "14px",
        fontWeight: "600",
      },
    },
  };
};

const eventSource = createItemSource<EventCard>({
  label: "Events",
  mappingFields: {
    image: createImageField("Image"),
    name: createTextField("Event Name"),
    eventTime: createTimestampDataField("Event Time"),
    description: createRichTextField("Description"),
    cta: {
      label: "CTA",
      type: "comprehensiveCTA",
    },
  },
  defaultValues: [
    {
      image: createDefaultImageValue(defaultImages[0], "Event image"),
      name: createEntityText("Quarterly Market Outlook Breakfast"),
      eventTime: createDefaultTimestamp("2026-06-20T08:30:00"),
      description: createEntityRichText(
        "Join local advisors for a discussion on market conditions, retirement confidence, and planning priorities for the second half of the year.",
      ),
      cta: createDefaultCta("Reserve your spot", "#"),
    },
    {
      image: createDefaultImageValue(defaultImages[1], "Event image"),
      name: createEntityText("Retirement Planning Workshop"),
      eventTime: createDefaultTimestamp("2026-07-09T17:30:00"),
      description: createEntityRichText(
        "A practical workshop covering income planning, tax-aware withdrawal strategies, and portfolio alignment for retirement transitions.",
      ),
      cta: createDefaultCta("View details", "#"),
    },
    {
      image: createDefaultImageValue(defaultImages[2], "Event image"),
      name: createEntityText("Small Business Owner Roundtable"),
      eventTime: createDefaultTimestamp("2026-07-24T12:00:00"),
      description: createEntityRichText(
        "A focused conversation for entrepreneurs exploring succession planning, liquidity events, and long-term financial organization.",
      ),
      cta: createDefaultCta("Request an invite", "#"),
    },
  ],
});

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

  const resolved = resolveComponentData(value, locale, streamDocument, {
    output: "plainText",
  });

  if (typeof resolved === "string") {
    return resolved;
  }

  if (resolved && typeof resolved === "object" && "defaultValue" in resolved) {
    const defaultValue = (resolved as Record<string, unknown>).defaultValue;
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

const textStyleToCss = (styles?: Partial<StyledTextValue>): CSSProperties => {
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
  };
};

const EventsFields: YextFields<PersonalFinanceEventsProps> = {
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
      events: eventSource.field,
    },
  },
  styles: {
    label: "Style",
    type: "object",
    objectFields: {
      cardBackgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      image: createImageStyleField("Image"),
      name: createStyledTextField("Event Name"),
      eventTime: {
        label: "Event Time",
        type: "object",
        objectFields: {
          includeTime: {
            label: "Include Time",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          includeRange: {
            label: "Include Range",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      description: createStyledRtfField("Description"),
    },
  },
};

export const PersonalFinanceEventsComponent: PuckComponent<
  PersonalFinanceEventsProps
> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const events = eventSource.resolveItems(props.content.events, streamDocument);
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const sectionForegroundColor = resolveThemeColor(
    sectionForeground,
    "#1a1a1a",
  );
  const cardBackgroundColor = resolveThemeColor(
    props.styles.cardBackgroundColor,
    "#ffffff",
  );
  const cardForegroundColor = resolveThemeColor(
    props.styles.cardBackgroundColor?.contrastingColor,
    sectionForegroundColor,
  );
  const resolvedDescription = resolveComponentData(
    props.content.sectionDescription.text,
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

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceEvents${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={{
            backgroundColor: resolveThemeColor(
              props.section.backgroundColor,
              "#f8f8f8",
            ),
          }}
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
                    "Upcoming Events",
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
                  <div className="mt-3">{resolvedDescription}</div>
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
            <EntityField
              displayName="Events"
              fieldId={props.content.events.field}
              constantValueEnabled={props.content.events.constantValueEnabled}
            >
              <div className="grid justify-center gap-5 lg:grid-cols-3">
                {events.map((event, index) => {
                  const eventCtaField = (
                    props.content.events.constantValueEnabled
                      ? props.content.events.constantValue[index]?.cta
                      : props.content.events.mappings?.cta
                  ) as ComprehensiveCTAValue | undefined;
                  const title = resolvePlainText(
                    event.name,
                    locale,
                    streamDocument,
                    "Event name",
                  );
                  const imageWrapperStyle: React.CSSProperties = {
                    aspectRatio:
                      props.styles.image.aspectRatio > 0
                        ? props.styles.image.aspectRatio
                        : undefined,
                    borderRadius:
                      props.styles.image.styles?.borderRadius === "default"
                        ? undefined
                        : props.styles.image.styles?.borderRadius,
                    overflow:
                      props.styles.image.imageConstrain === "filled" ||
                      Boolean(
                        props.styles.image.styles?.borderRadius &&
                        props.styles.image.styles.borderRadius !== "default",
                      )
                        ? "hidden"
                        : undefined,
                  };
                  const imageStyle: React.CSSProperties = {
                    display: "block",
                    width: "100%",
                    height:
                      props.styles.image.aspectRatio > 0 ? "100%" : "auto",
                    objectFit:
                      props.styles.image.imageConstrain === "filled"
                        ? "cover"
                        : "contain",
                  };
                  const image = resolveLocalizedAssetImage(event.image, locale);
                  const timestampOption = props.styles.eventTime.includeRange
                    ? props.styles.eventTime.includeTime
                      ? TimestampOption.DATE_TIME_RANGE
                      : TimestampOption.DATE_RANGE
                    : props.styles.eventTime.includeTime
                      ? TimestampOption.DATE_TIME
                      : TimestampOption.DATE;
                  const descriptionStyles = {
                    ...props.styles.description.styles,
                    color: resolveThemeColor(
                      props.styles.description.fontColor,
                      cardForegroundColor,
                    ),
                  };
                  const description = resolveComponentData(
                    event.description ?? getDefaultRTF("Description"),
                    locale,
                    streamDocument,
                    { richTextStyleOverrides: descriptionStyles },
                  );

                  return (
                    <article
                      key={`${title}-${index}`}
                      className="overflow-hidden rounded-[16px] border border-black/5 shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                      style={{ backgroundColor: cardBackgroundColor }}
                    >
                      {hasImageSource(image) && image ? (
                        <div style={imageWrapperStyle}>
                          <Image
                            image={image}
                            className="w-full"
                            style={imageStyle}
                          />
                        </div>
                      ) : null}
                      <div className="p-6">
                        {event.eventTime.date ? (
                          <div
                            className="text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{ color: cardForegroundColor }}
                          >
                            <TimestampAtom
                              date={event.eventTime.date}
                              endDate={
                                props.styles.eventTime.includeRange
                                  ? event.eventTime.endDate
                                  : undefined
                              }
                              locale={locale}
                              option={timestampOption}
                            />
                          </div>
                        ) : null}
                        <h3
                          className="mt-3 text-[1.2rem] font-semibold"
                          style={{
                            color: resolveThemeColor(
                              props.styles.name.fontColor,
                              cardForegroundColor,
                            ),
                            ...textStyleToCss(props.styles.name.styles),
                          }}
                        >
                          {title}
                        </h3>
                        {React.isValidElement(description) ? (
                          <div className="mt-3">{description}</div>
                        ) : (
                          <MaybeRTF
                            data={normalizeResolvedRichText(description)}
                            className="mt-3 text-sm leading-7"
                            richTextStyleOverrides={{
                              ...descriptionStyles,
                            }}
                          />
                        )}
                        {event.cta ? (
                          <div className="mt-5">
                            <EntityField
                              displayName={`Event ${index + 1} CTA`}
                              fieldId={eventCtaField?.data.cta.field}
                              constantValueEnabled={
                                eventCtaField?.data.cta.constantValueEnabled
                              }
                            >
                              <ComprehensiveCTA
                                value={
                                  event.cta as Partial<ComprehensiveCTAValue>
                                }
                                className="min-h-0 justify-start border-0 bg-transparent px-0 py-0 text-sm font-semibold shadow-none"
                              />
                            </EntityField>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceEvents: YextComponentConfig<PersonalFinanceEventsProps> =
  {
    label: "Events",
    fields: EventsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Upcoming Events"),
        sectionDescription: createStyledRtfDefault(
          "Highlight upcoming seminars, planning workshops, or community conversations in the same polished card format used throughout the template.",
        ),
        events: eventSource.defaultValue,
      },
      styles: {
        cardBackgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        image: {
          aspectRatio: 3 / 2,
          imageConstrain: "filled",
          styles: defaultImageStyle,
        },
        name: createStyledTextDefault("Event Name"),
        eventTime: {
          includeTime: true,
          includeRange: false,
        },
        description: createStyledRtfDefault("Event description"),
      },
    },
    render: PersonalFinanceEventsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceEvents",
  displayName: "Events",
  description: "Events",
  pageSetTypes: ["ENTITY"],
};
