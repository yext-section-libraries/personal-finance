import type { SectionConfig } from "@yext/visual-editor";

import {
  createStyledRtfDefault,
  createStyledRtfField,
  createStyledTextField,
  defaultTextStyle,
  getScopedTypographyCss,
  hasImageSource,
  normalizeResolvedRichText,
  resolvePlainText,
  resolveThemeColor,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  getAnalyticsScopeHash,
  resolveComponentData,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type ComprehensiveCTAValue,
  type EntityFieldSelectorField,
  type StyledButtonValue,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextCTAField,
  type YextEntityField,
} from "@yext/visual-editor";
import {
  AnalyticsScopeProvider,
  HoursStatus,
  type HoursType,
  type StatusParams,
} from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";

type StyledImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type EyebrowStyleProps = {
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
  backgroundColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type HoursStatusStyles = {
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
  dayOfWeekFormat: "short" | "long";
  showDayNames: boolean;
};

type SectionTheme = {
  heroImage: StyledImageProps;
  visibleOnLivePage: boolean;
};

type HeroContent = {
  statusEyebrow: EyebrowStyleProps;
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStatusStyles;
  headline: StyledTextProps;
  body: StyledRtfProps;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
};

type PersonalFinanceHeroProps = {
  overlayColor: ThemeColor;
  section: SectionTheme;
  content: HeroContent;
};

const typographyScopeClass = "yextPersonalFinanceHeroTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const defaultButtonStyle: StyledButtonValue = {
  ...defaultTextStyle,
  borderRadius: "default",
  letterSpacing: "default",
};

const defaultImageStyle: StyledImageValue = {
  borderRadius: "default",
};

const HERO_IMAGE_URL =
  "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg";

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

const createEyebrowField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText" as const,
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector" as const,
        options: "SITE_COLOR" as const,
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector" as const,
        options: "BACKGROUND_COLOR" as const,
      },
    },
  };
};

const createHeadlineDefault = (): StyledTextProps => {
  return {
    text: {
      field: "name",
      constantValue: {
        defaultValue: "",
      },
      constantValueEnabled: false,
    },
    styles: defaultTextStyle,
  };
};

const createEyebrowDefault = (
  fontColor?: ThemeColor,
  backgroundColor?: ThemeColor,
): EyebrowStyleProps => {
  return {
    styles: defaultTextStyle,
    fontColor,
    backgroundColor,
  };
};

const createDefaultImage = (url: string, altText: string): StyledImageProps => {
  return {
    image: {
      field: "",
      constantValue: {
        url,
        width: 1900,
        height: 1267,
        alternateText: {
          defaultValue: altText,
          hasLocalizedValue: "true",
        },
      } as TranslatableAssetImage,
      constantValueEnabled: true,
    },
    imageConstrain: "filled",
    styles: defaultImageStyle,
  };
};

const createDefaultCta = (
  label: string,
  link: string,
  variant: "primary" | "secondary",
  color: ThemeColor,
) => {
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
      variant,
      color,
      button: defaultButtonStyle,
    },
  } satisfies ComprehensiveCTAValue;
};

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const textStyleToCss = (
  styles?: Partial<StyledTextValue>,
  fontColor?: string | ThemeColor,
  fallbackColor?: string,
): CSSProperties => {
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

const overlayMask =
  "linear-gradient(90deg, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.74) 38%, rgba(0, 0, 0, 0.26) 68%, rgba(0, 0, 0, 0.08) 100%)";

const SectionFields: YextFields<PersonalFinanceHeroProps> = {
  overlayColor: {
    label: msg("fields.overlayColor", "Overlay Color"),
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  section: {
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      heroImage: {
        label: msg("fields.heroImage", "Hero Image"),
        type: "object",
        objectFields: {
          image: createImageField(msg("fields.image", "Image")),
          imageConstrain: {
            label: msg("fields.imageConstrain", "Image Constrain"),
            type: "select",
            options: [
              { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
              { label: msg("fields.options.filled", "Filled"), value: "filled" },
            ],
          },
          styles: {
            label: msg("fields.imageStyles", "Image Styles"),
            type: "styledImage",
          },
        },
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
      statusEyebrow: createEyebrowField(msg("fields.statusEyebrow", "Status Eyebrow")),
      hours: {
        type: "entityField",
        label: msg("fields.hours", "Hours"),
        filter: {
          types: ["type.hours"],
        },
        disableConstantValueToggle: true,
      },
      hoursStyles: {
        label: msg("fields.hoursStyles", "Hours Styles"),
        type: "object",
        objectFields: {
          showCurrentStatus: {
            label: msg("fields.showCurrentStatus", "Show Current Status"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
          timeFormat: {
            label: msg("fields.timeFormat", "Time Format"),
            type: "select",
            options: [
              { label: msg("fields.options.12Hour", "12 Hour"), value: "12h" },
              { label: msg("fields.options.24Hour", "24 Hour"), value: "24h" },
            ],
          },
          dayOfWeekFormat: {
            label: msg("fields.dayOfWeekFormat", "Day Of Week Format"),
            type: "select",
            options: [
              { label: msg("fields.options.short", "Short"), value: "short" },
              { label: msg("fields.options.long", "Long"), value: "long" },
            ],
          },
          showDayNames: {
            label: msg("fields.showDayNames", "Show Day Names"),
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          },
        },
      },
      headline: createStyledTextField(msg("fields.headline", "Headline")),
      body: createStyledRtfField(msg("fields.body", "Body")),
      primaryCta: {
        label: msg("fields.primaryCta", "Primary CTA"),
        type: "comprehensiveCTA",
      },
      secondaryCta: {
        label: msg("fields.secondaryCta", "Secondary CTA"),
        type: "comprehensiveCTA",
      },
    },
  },
};

export const PersonalFinanceHeroComponent: PuckComponent<
  PersonalFinanceHeroProps
> = (props) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale =
    (streamDocument?.locale as string | undefined) ?? i18n.language ?? "en";
  const sectionForeground = "#ffffff";
  const overlayColor = resolveThemeColor(
    props.overlayColor,
    "var(--colors-palette-primary)",
  );
  const heroHours = resolveComponentData(
    props.content.hours,
    locale,
    streamDocument,
  ) as HoursType | undefined;
  const timezone =
    typeof streamDocument?.timezone === "string"
      ? streamDocument.timezone
      : undefined;
  const headline = resolvePlainText(
    props.content.headline.text,
    locale,
    streamDocument,
    "[[name]]",
  );
  const bodyColor = resolveThemeColor(
    props.content.body.fontColor,
    sectionForeground,
  );
  const richTextStyleOverrides = {
    ...props.content.body.styles,
    color: bodyColor,
  };
  const resolvedBody = resolveComponentData(
    props.content.body.text as never,
    locale,
    streamDocument,
  );
  const resolvedHeroImage = resolveComponentData(
    props.section.heroImage.image,
    locale,
    streamDocument,
  );
  const eyebrowBackgroundColor = resolveThemeColor(
    props.content.statusEyebrow.backgroundColor,
    "#ffffff",
  );
  const heroImageWrapperStyle: React.CSSProperties = {
    borderRadius:
      props.section.heroImage.styles?.borderRadius === "default"
        ? undefined
        : props.section.heroImage.styles?.borderRadius,
    overflow:
      props.section.heroImage.imageConstrain === "filled" ||
      Boolean(
        props.section.heroImage.styles?.borderRadius &&
        props.section.heroImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceHero${getAnalyticsScopeHash(props.id)}`}
      >
        <section className={`${typographyScopeClass} overflow-x-clip`}>
          <style>{typographyScopeCss}</style>
          <div className="relative isolate overflow-hidden">
            {hasImageSource(resolvedHeroImage) && resolvedHeroImage ? (
              <EntityField
                displayName="Hero Image"
                fieldId={props.section.heroImage.image.field}
                constantValueEnabled={
                  props.section.heroImage.image.constantValueEnabled
                }
              >
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ ...heroImageWrapperStyle, zIndex: 0 }}
                >
                  <Image
                    image={resolvedHeroImage}
                    className="h-full w-full object-cover object-[72%_50%]"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit:
                        props.section.heroImage.imageConstrain === "filled"
                          ? "cover"
                          : "contain",
                    }}
                  />
                </div>
              </EntityField>
            ) : null}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundColor: overlayColor,
                maskImage: overlayMask,
                WebkitMaskImage: overlayMask,
                zIndex: 1,
              }}
            />
            <div
              className="relative mx-auto flex min-h-[540px] max-w-[1410px] items-center px-6 py-12 md:min-h-[640px] md:py-16 lg:min-h-[680px] lg:py-20"
              style={{ zIndex: 2 }}
            >
              <div className="relative z-[1] flex min-w-0 max-w-[980px] flex-col gap-6 py-2">
                {heroHours && timezone ? (
                  <EntityField
                    displayName="Hours Status"
                    fieldId={props.content.hours.field}
                    constantValueEnabled={
                      props.content.hours.constantValueEnabled
                    }
                  >
                    <div
                      className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.06em]"
                      style={{
                        borderColor: "rgba(255,255,255,0.48)",
                        backgroundColor: eyebrowBackgroundColor,
                        opacity: 0.72,
                        ...textStyleToCss(
                          props.content.statusEyebrow.styles,
                          props.content.statusEyebrow.fontColor,
                          "#44525c",
                        ),
                      }}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
                      <HoursStatus
                        hours={heroHours}
                        timezone={timezone}
                        comingSoon={Boolean(streamDocument?.comingSoon)}
                        dayOptions={{
                          weekday: props.content.hoursStyles.dayOfWeekFormat,
                        }}
                        timeOptions={{
                          hour12:
                            props.content.hoursStyles.timeFormat === "12h",
                        }}
                        statusTemplate={(params: StatusParams) => {
                          const isComingSoon = Boolean(params.comingSoon);
                          const isOpen24Hours = Boolean(
                            params.currentInterval?.is24h?.(),
                          );
                          const isIndefinitelyClosed = !params.futureInterval;
                          const interval = params.isOpen
                            ? params.currentInterval
                            : params.futureInterval;
                          const time = params.isOpen
                            ? (interval?.getEndTime(
                                locale,
                                params.timeOptions,
                              ) ?? "")
                            : (interval?.getStartTime(
                                locale,
                                params.timeOptions,
                              ) ?? "");
                          const showDayOfWeek =
                            props.content.hoursStyles.showDayNames &&
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
                          const isFuture =
                            !isOpen24Hours && !isIndefinitelyClosed;
                          const futureText = !isFuture || !time
                            ? ""
                            : params.isOpen
                              ? dayOfWeek
                                ? t(
                                    "closesAtTimeWeek",
                                    "Closes at {{time}} {{dayOfWeek}}",
                                    { time, dayOfWeek },
                                  )
                                : t("closesAtTime", "Closes at {{time}}", {
                                    time,
                                  })
                              : dayOfWeek
                                ? t(
                                    "opensAtTimeWeek",
                                    "Opens at {{time}} {{dayOfWeek}}",
                                    { time, dayOfWeek },
                                  )
                                : t("opensAtTime", "Opens at {{time}}", {
                                    time,
                                  });
                          const currentStatus = isComingSoon
                            ? t("comingSoon", "Coming Soon")
                            : isOpen24Hours
                              ? t("open24Hours", "Open 24 Hours")
                              : isIndefinitelyClosed
                                ? t("temporarilyClosed", "Temporarily Closed")
                                : params.isOpen
                                  ? t("openNow", "Open Now")
                                  : t("closed", "Closed");

                          return (
                            <div>
                              {props.content.hoursStyles.showCurrentStatus ||
                              isComingSoon ? (
                                <span>{currentStatus}</span>
                              ) : null}
                              {!isComingSoon &&
                              props.content.hoursStyles.showCurrentStatus &&
                              futureText ? (
                                <span aria-hidden="true"> • </span>
                              ) : null}
                              {futureText ? <span>{futureText}</span> : null}
                            </div>
                          );
                        }}
                      />
                    </div>
                  </EntityField>
                ) : null}
                <div className="space-y-4">
                  <EntityField
                    displayName="Headline"
                    fieldId={props.content.headline.text.field}
                    constantValueEnabled={
                      props.content.headline.text.constantValueEnabled
                    }
                  >
                    <h1
                      className="max-w-[980px] text-[2.7rem] font-bold leading-[0.98] tracking-[-0.055em] md:text-[4.5rem] lg:text-[5rem]"
                      style={textStyleToCss(
                        props.content.headline.styles,
                        props.content.headline.fontColor,
                        sectionForeground,
                      )}
                    >
                      {headline}
                    </h1>
                  </EntityField>
                  <EntityField
                    displayName="Body"
                    fieldId={props.content.body.text.field}
                    constantValueEnabled={
                      props.content.body.text.constantValueEnabled
                    }
                  >
                    <div className="max-w-[900px] text-[1rem] leading-8 md:text-[1.08rem]">
                      {React.isValidElement(resolvedBody) ? (
                        resolvedBody
                      ) : (
                        <MaybeRTF
                          data={normalizeResolvedRichText(resolvedBody)}
                          richTextStyleOverrides={richTextStyleOverrides}
                        />
                      )}
                    </div>
                  </EntityField>
                </div>
                <div className="flex flex-wrap gap-5 pt-1">
                  <EntityField
                    displayName="Primary CTA"
                    fieldId={props.content.primaryCta.data.cta.field}
                    constantValueEnabled={
                      props.content.primaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.content
                          .primaryCta as Partial<ComprehensiveCTAValue>
                      }
                      className="min-h-[60px] rounded-[14px] px-8 py-3 text-base font-semibold"
                    />
                  </EntityField>
                  <EntityField
                    displayName="Secondary CTA"
                    fieldId={props.content.secondaryCta.data.cta.field}
                    constantValueEnabled={
                      props.content.secondaryCta.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.content
                          .secondaryCta as Partial<ComprehensiveCTAValue>
                      }
                      className="min-h-[60px] rounded-[14px] px-8 py-3 text-base font-semibold"
                    />
                  </EntityField>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceHero: YextComponentConfig<PersonalFinanceHeroProps> =
  {
    label: "Hero",
    fields: SectionFields,
    defaultProps: {
      overlayColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      section: {
        heroImage: createDefaultImage(HERO_IMAGE_URL, "Hero image"),
        visibleOnLivePage: true,
      },
      content: {
        statusEyebrow: createEyebrowDefault(undefined, {
          selectedColor: "white",
          contrastingColor: "black",
        }),
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        } as YextEntityField<HoursType>,
        hoursStyles: {
          showCurrentStatus: true,
          timeFormat: "12h",
          dayOfWeekFormat: "long",
          showDayNames: true,
        },
        headline: createHeadlineDefault(),
        body: createStyledRtfDefault(
          "[[name]] - [[geomodifier]] [[address.city]] provides wealth management, retirement planning, and financial advisory services for individuals, families, and business owners across the [[address.city]] metro area.",
        ),
        primaryCta: createDefaultCta("Schedule Consultation", "#", "primary", {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        }),
        secondaryCta: createDefaultCta("Get Directions", "#", "secondary", {
          selectedColor: "white",
          contrastingColor: "black",
        }),
      },
    },
    render: PersonalFinanceHeroComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceHero",
  displayName: "Hero",
  description: "Hero",
  pageSetTypes: ["ENTITY"],
};
