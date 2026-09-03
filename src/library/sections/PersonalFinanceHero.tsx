import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
  getAnalyticsScopeHash,
  getDefaultRTF,
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

const hasImageSource = (image: TranslatableAssetImage | undefined): boolean => {
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

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceHeroTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceHeroTypographyScope p,
.yextPersonalFinanceHeroTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceHeroTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceHeroTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceHeroTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceHeroTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceHeroTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceHeroTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceHeroTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceHeroTypographyScope a:hover {
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

const HERO_IMAGE_URL =
  "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg";

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

const createEyebrowField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
      styles: {
        label: "Text Styles",
        type: "styledText" as const,
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector" as const,
        options: "SITE_COLOR" as const,
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector" as const,
        options: "BACKGROUND_COLOR" as const,
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

const createOverlayGradient = (color: string): string => {
  return `linear-gradient(90deg, color-mix(in srgb, ${color} 88%, transparent) 0%, color-mix(in srgb, ${color} 74%, transparent) 38%, color-mix(in srgb, ${color} 26%, transparent) 68%, color-mix(in srgb, ${color} 8%, transparent) 100%)`;
};

const SectionFields: YextFields<PersonalFinanceHeroProps> = {
  overlayColor: {
    label: "Overlay Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      heroImage: {
        label: "Hero Image",
        type: "object",
        objectFields: {
          image: createImageField("Image"),
          imageConstrain: {
            label: "Image Constrain",
            type: "select",
            options: [
              { label: "Fixed", value: "fixed" },
              { label: "Filled", value: "filled" },
            ],
          },
          styles: {
            label: "Image Styles",
            type: "styledImage",
          },
        },
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
      statusEyebrow: createEyebrowField("Status Eyebrow"),
      hours: {
        type: "entityField",
        label: "Hours",
        filter: {
          types: ["type.hours"],
        },
        disableConstantValueToggle: true,
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
      headline: createStyledTextField("Headline"),
      body: createStyledRtfField("Body"),
      primaryCta: {
        label: "Primary CTA",
        type: "comprehensiveCTA",
      },
      secondaryCta: {
        label: "Secondary CTA",
        type: "comprehensiveCTA",
      },
    },
  },
};

export const PersonalFinanceHeroComponent: PuckComponent<
  PersonalFinanceHeroProps
> = (props) => {
  const { i18n } = useTranslation();
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
    {
      richTextStyleOverrides,
    },
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
                  style={heroImageWrapperStyle}
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
              className="absolute inset-0"
              style={{ backgroundImage: createOverlayGradient(overlayColor) }}
            />
            <div className="relative mx-auto flex min-h-[540px] max-w-[1410px] items-center px-6 py-12 md:min-h-[640px] md:py-16 lg:min-h-[680px] lg:py-20">
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
                              {props.content.hoursStyles.showCurrentStatus ? (
                                <span>
                                  {params.isOpen ? "Open Now" : "Closed"}
                                </span>
                              ) : null}
                              {props.content.hoursStyles.showCurrentStatus &&
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
