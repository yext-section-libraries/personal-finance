import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
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
): image is ImageType | ComplexImageType | TranslatableAssetImage => {
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

type CardImageValue = YextEntityField<
  ImageType | ComplexImageType | TranslatableAssetImage
>;

type CardImageStyles = {
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type ServiceCard = {
  image: CardImageValue;
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: unknown;
};

type FeaturedServicesContent = {
  sectionHeading: StyledTextProps;
  sectionDescription: StyledRtfProps;
  cards: typeof servicesSource.value;
};

type FeaturedServicesStyles = {
  image: CardImageStyles;
  title: Omit<StyledTextProps, "text">;
  description: Omit<StyledRtfProps, "text">;
};

type PersonalFinanceFeaturedServicesProps = {
  section: SectionTheme;
  content: FeaturedServicesContent;
  styles: FeaturedServicesStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass =
  "yextPersonalFinanceFeaturedServicesTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceFeaturedServicesTypographyScope p,
.yextPersonalFinanceFeaturedServicesTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceFeaturedServicesTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceFeaturedServicesTypographyScope a:hover {
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

const PORTRAIT_IMAGE_URLS = [
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
  "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
  "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
];

const createCapturedAssetUrl = (filename: string) => {
  const index =
    [...filename].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    PORTRAIT_IMAGE_URLS.length;
  return PORTRAIT_IMAGE_URLS[index];
};

const defaultServiceImageUrls = [
  createCapturedAssetUrl("service1.jpg"),
  createCapturedAssetUrl("service2.jpg"),
  createCapturedAssetUrl("service3.jpg"),
  createCapturedAssetUrl("service4.jpg"),
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

const createStyledTextField = (label: string) => {
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
    },
  };
};

const createStyledTextFieldWithData = (label: string) => {
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

const createStyledRtfFieldWithData = (label: string) => {
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

const createDefaultImageField = (
  url: string,
  alternateText: string,
): CardImageValue => ({
  field: "",
  constantValue: {
    url,
    width: 1267,
    height: 1900,
    alternateText,
  },
  constantValueEnabled: true,
});

const createDefaultCta = (label: string, link = "#"): ComprehensiveCTAValue => {
  const ctaField: YextCTAField = {
    field: "",
    constantValue: {
      ctaType: "textAndLink",
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
      buttonText: {
        defaultValue: "Button",
      },
      customId: "",
      customClass: "",
      dataAttributes: [],
      ariaLabel: {
        defaultValue: "Button",
      },
    },
    styles: {
      variant: "link" as const,
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      button: {
        ...defaultButtonStyle,
        fontSize: "14px",
        fontWeight: "500",
      },
    },
  } as ComprehensiveCTAValue;
};

const servicesSource = createItemSource<ServiceCard>({
  label: "Service Cards",
  mappingFields: {
    image: createImageField("Image"),
    title: createTextField("Title"),
    description: createRichTextField("Description"),
    cta: {
      label: "CTA",
      type: "comprehensiveCTA" as const,
    },
  },
  defaultValues: [
    {
      image: createDefaultImageField(
        defaultServiceImageUrls[0],
        "Service image",
      ),
      title: createEntityText("Wealth Management"),
      description: createEntityRichText(
        "Portfolio oversight and account review support for clients seeking ongoing guidance.",
      ),
      cta: createDefaultCta("Schedule a Wealth Review", "#"),
    },
    {
      image: createDefaultImageField(
        defaultServiceImageUrls[1],
        "Service image",
      ),
      title: createEntityText("Retirement Planning"),
      description: createEntityRichText(
        "Planning conversations for retirement timelines, income needs, and account coordination.",
      ),
      cta: createDefaultCta("Book a Retirement Consultation", "#"),
    },
    {
      image: createDefaultImageField(
        defaultServiceImageUrls[2],
        "Service image",
      ),
      title: createEntityText("Investment Management"),
      description: createEntityRichText(
        "Ongoing investment strategy support based on client objectives and risk considerations.",
      ),
      cta: createDefaultCta("Request an Investment Review", "#"),
    },
    {
      image: createDefaultImageField(
        defaultServiceImageUrls[3],
        "Service image",
      ),
      title: createEntityText("Financial Planning"),
      description: createEntityRichText(
        "Goal-based planning conversations covering cash flow, savings, and long-term priorities.",
      ),
      cta: createDefaultCta("Speak With an Advisor", "#"),
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

const FeaturedServicesFields: YextFields<PersonalFinanceFeaturedServicesProps> =
  {
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
        sectionHeading: createStyledTextFieldWithData("Heading"),
        sectionDescription: createStyledRtfFieldWithData("Description"),
        cards: servicesSource.field,
      },
    },
    styles: {
      label: "Styles",
      type: "object",
      objectFields: {
        image: createImageStyleField("Image"),
        title: createStyledTextField("Title"),
        description: createStyledRtfField("Description"),
      },
    },
  };

export const PersonalFinanceFeaturedServicesComponent: PuckComponent<
  PersonalFinanceFeaturedServicesProps
> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const cards = servicesSource.resolveItems(
    props.content.cards,
    streamDocument,
  );
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const sectionForegroundColor = resolveThemeColor(
    sectionForeground,
    "#1a1a1a",
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
        name={`PersonalFinanceFeaturedServices${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          id="services"
          className={`${typographyScopeClass} overflow-x-clip border-t border-black/5 py-11`}
          style={{
            backgroundColor: resolveThemeColor(
              props.section.backgroundColor,
              "#f8f8f8",
            ),
          }}
        >
          <style>{typographyScopeCss}</style>
          <div className="mx-auto max-w-[1410px] px-6">
            <div className="mx-auto mb-8 max-w-[1100px] text-center">
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
                    "Featured Services",
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
                    className="mt-3 text-sm leading-6"
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
              displayName="Service Cards"
              fieldId={props.content.cards.field}
              constantValueEnabled={props.content.cards.constantValueEnabled}
            >
              <div className="grid justify-center gap-5 md:[grid-template-columns:repeat(2,minmax(280px,360px))] xl:[grid-template-columns:repeat(4,minmax(240px,300px))]">
                {cards.map((card, index) => {
                  const cardCta = card.cta as
                    Partial<ComprehensiveCTAValue> | undefined;
                  const cardCtaSource = (
                    props.content.cards.constantValueEnabled
                      ? props.content.cards.constantValue[index]?.cta
                      : props.content.cards.mappings?.cta
                  ) as ComprehensiveCTAValue | undefined;
                  const cardCtaField = cardCtaSource?.data.cta;
                  const title = resolvePlainText(
                    card.title,
                    locale,
                    streamDocument,
                  );
                  const image = resolveLocalizedAssetImage(
                    card.image as
                      ImageType | TranslatableAssetImage | undefined,
                    locale,
                  );
                  const description = resolveComponentData(
                    card.description ?? createEntityRichText(""),
                    locale,
                    streamDocument,
                    {
                      richTextStyleOverrides: {
                        ...props.styles.description.styles,
                        color: resolveThemeColor(
                          props.styles.description.fontColor,
                          sectionForegroundColor,
                        ),
                      },
                    },
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

                  return (
                    <article
                      key={`${title}-${index}`}
                      className="grid min-w-0 w-full content-start gap-4"
                    >
                      <div
                        aria-hidden={!hasImageSource(image)}
                        style={imageWrapperStyle}
                      >
                        {hasImageSource(image) ? (
                          <Image
                            image={image}
                            className="w-full"
                            style={imageStyle}
                          />
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <h3
                          className="text-[1.15rem] font-semibold"
                          style={{
                            color: resolveThemeColor(
                              props.styles.title.fontColor,
                              sectionForegroundColor,
                            ),
                            ...textStyleToCss(props.styles.title.styles),
                          }}
                        >
                          {title}
                        </h3>
                        {React.isValidElement(description) ? (
                          description
                        ) : (
                          <MaybeRTF
                            data={normalizeResolvedRichText(description)}
                            className="text-sm leading-6"
                            richTextStyleOverrides={{
                              ...props.styles.description.styles,
                              color: resolveThemeColor(
                                props.styles.description.fontColor,
                                sectionForegroundColor,
                              ),
                            }}
                          />
                        )}
                      </div>
                      {cardCta
                        ? (() => {
                            const ctaVariant = cardCta.styles?.variant;

                            return (
                              <EntityField
                                displayName={`Service ${index + 1} CTA`}
                                fieldId={cardCtaField?.field}
                                constantValueEnabled={
                                  cardCtaField?.constantValueEnabled
                                }
                              >
                                <ComprehensiveCTA
                                  value={cardCta}
                                  className={
                                    ctaVariant === "link"
                                      ? "min-h-0 justify-start border-0 bg-transparent px-0 py-0 text-sm font-medium shadow-none"
                                      : "inline-flex min-h-[44px] items-center justify-center rounded-[10px] px-5 py-2.5 text-sm font-medium"
                                  }
                                />
                              </EntityField>
                            );
                          })()
                        : null}
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

export const PersonalFinanceFeaturedServices: YextComponentConfig<PersonalFinanceFeaturedServicesProps> =
  {
    label: "Featured Services",
    fields: FeaturedServicesFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Featured Services"),
        sectionDescription: createStyledRtfDefault(
          "Explore the advisory services available at [[name]] - [[geomodifier]] [[address.city]].",
        ),
        cards: servicesSource.defaultValue,
      },
      styles: {
        image: {
          aspectRatio: 4 / 3,
          imageConstrain: "filled",
          styles: defaultImageStyle,
        },
        title: createStyledTextDefault("Service Title"),
        description: createStyledRtfDefault("Service description."),
      },
    },
    render: PersonalFinanceFeaturedServicesComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceFeaturedServices",
  displayName: "Featured Services",
  description: "Featured Services",
  pageSetTypes: ["ENTITY"],
};
