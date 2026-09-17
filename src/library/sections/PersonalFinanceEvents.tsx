import type { SectionConfig } from "@yext/visual-editor";

import {
  aspectRatioOptions,
  createEntityRichText,
  createEntityText,
  createRichTextField,
  createStyledRtfDefault,
  createStyledRtfField,
  createStyledTextDefault,
  createStyledTextField,
  createTextField,
  defaultTextStyle,
  getScopedTypographyCss,
  hasImageSource,
  normalizeResolvedRichText,
  resolvePlainText,
  resolveThemeColor,
  textStyleToCss,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  TimestampAtom,
  TimestampOption,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
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

const typographyScopeClass = "yextPersonalFinanceEventsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

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

const createImageStyleField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
      aspectRatio: {
        type: "basicSelector" as const,
        label: msg("fields.aspectRatio", "Aspect Ratio"),
        options: aspectRatioOptions,
      },
      imageConstrain: {
        label: msg("fields.imageConstrain", "Image Constrain"),
        type: "select" as const,
        options: [
          { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
          { label: msg("fields.options.filled", "Filled"), value: "filled" },
        ],
      },
      styles: {
        label: msg("fields.imageStyles", "Image Styles"),
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
        label: msg("fields.date", "Date"),
        filter,
      },
      endDate: {
        type: "entityField" as const,
        label: msg("fields.endDate", "End Date"),
        filter,
      },
    },
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
  label: msg("fields.events", "Events"),
  mappingFields: {
    image: createImageField(msg("fields.image", "Image")),
    name: createTextField(msg("fields.eventName", "Event Name")),
    eventTime: createTimestampDataField(msg("fields.eventTime", "Event Time")),
    description: createRichTextField(msg("fields.description", "Description")),
    cta: {
      label: msg("fields.cta", "CTA"),
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

const EventsFields: YextFields<PersonalFinanceEventsProps> = {
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  content: {
    label: msg("fields.content", "Content"),
    type: "object",
    objectFields: {
      sectionHeading: createStyledTextField(msg("fields.heading", "Heading")),
      sectionDescription: createStyledRtfField(msg("fields.description", "Description")),
      events: eventSource.field,
    },
  },
  styles: {
    label: msg("fields.style", "Style"),
    type: "object",
    objectFields: {
      cardBackgroundColor: {
        label: msg("fields.cardBackgroundColor", "Card Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      image: createImageStyleField(msg("fields.image", "Image")),
      name: createStyledTextField(msg("fields.eventName", "Event Name")),
      eventTime: {
        label: msg("fields.eventTime", "Event Time"),
        type: "object",
        objectFields: {
          includeTime: {
            label: msg("fields.includeTime", "Include Time"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
          includeRange: {
            label: msg("fields.includeRange", "Include Range"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
        },
      },
      description: createStyledRtfField(msg("fields.description", "Description")),
    },
  },
};

export const PersonalFinanceEventsComponent: PuckComponent<
  PersonalFinanceEventsProps
> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const events = eventSource.resolveItems(props.content.events, streamDocument);
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  const cardStyle = getSurfaceColorStyle(
    props.styles.cardBackgroundColor,
    streamDocument,
  );
  const cardForegroundColor = cardStyle?.color ?? sectionForegroundColor;
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
        name={`PersonalFinanceEvents${getAnalyticsScopeHash(props.id)}`}
      >
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
                  );

                  return (
                    <Background
                      as="div"
                      background={props.styles.cardBackgroundColor}
                      key={`${title}-${index}`}
                      className="overflow-hidden rounded-[16px] border border-black/5 shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                      style={cardStyle}
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
                    </Background>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </Background>
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
