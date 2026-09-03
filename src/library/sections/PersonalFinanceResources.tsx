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
  type EnhancedTranslatableCTA,
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

type ResourceCard = {
  image: YextEntityField<TranslatableAssetImage>;
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  primaryCta: unknown;
};

type ResourcesStyles = {
  image: Omit<CardImageProps, "image">;
  title: Omit<StyledTextProps, "text">;
  description: Omit<StyledRtfProps, "text">;
};

type ResourcesContent = {
  cardSurface: {
    backgroundColor: ThemeColor;
  };
  cards: typeof resourceCardSource.value;
};

type PersonalFinanceResourcesProps = {
  section: SectionTheme;
  content: ResourcesContent;
  styles: ResourcesStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceResourcesTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceResourcesTypographyScope p,
.yextPersonalFinanceResourcesTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceResourcesTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceResourcesTypographyScope a:hover {
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

const PORTRAIT_IMAGE_URLS = [
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
  "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
  "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
];

const createCapturedAssetUrl = (filename: string) => {
  if (filename === "hero.jpg") {
    return HERO_IMAGE_URL;
  }

  const index =
    [...filename].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    PORTRAIT_IMAGE_URLS.length;
  return PORTRAIT_IMAGE_URLS[index];
};

const promoImageOne = createCapturedAssetUrl("promo1.jpg");
const promoImageTwo = createCapturedAssetUrl("promo2.jpg");

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

const createDefaultImageValue = (
  url: string,
): YextEntityField<TranslatableAssetImage> => {
  const isHero = url === HERO_IMAGE_URL;
  return {
    field: "",
    constantValue: {
      url,
      width: isHero ? 1900 : 1267,
      height: isHero ? 1267 : 1900,
    },
    constantValueEnabled: true,
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

const createPrimaryCta = (label: string, link = "#"): ComprehensiveCTAValue => {
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
        selectedColor: "white",
        contrastingColor: "black",
      },
      button: defaultButtonStyle,
    },
  };
};

const resourceCardSource = createItemSource<ResourceCard>({
  label: "Resource Cards",
  mappingFields: {
    image: createImageField("Image"),
    title: createTextField("Title"),
    description: createRichTextField("Description"),
    primaryCta: {
      label: "Primary CTA",
      type: "comprehensiveCTA",
    },
  },
  defaultValues: [
    {
      image: createDefaultImageValue(promoImageOne),
      title: createEntityText("Before You Meet With Us"),
      description: createEntityRichText(
        "Prospective clients can review advisor credentials, disclosures, and service information before scheduling a consultation. Additional regulatory and advisory disclosures are available through the links below.",
      ),
      primaryCta: createPrimaryCta("", "#"),
    },
    {
      image: createDefaultImageValue(promoImageTwo),
      title: createEntityText("Community & Client Resources"),
      description: createEntityRichText(
        "[[name]] regularly hosts educational workshops and retirement planning events for [[address.city]]-area residents. Clients can also schedule appointments, review meeting details, and securely manage communications through the [[name]] client portal and mobile app.",
      ),
      primaryCta: createPrimaryCta("View Event Calendar", "#"),
    },
  ],
});

const withAlpha = (color: string, alpha: number) => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);

    if (hex.length === 3) {
      const [r, g, b] = hex.split("");
      return `rgba(${parseInt(r + r, 16)}, ${parseInt(g + g, 16)}, ${parseInt(
        b + b,
        16,
      )}, ${alpha})`;
    }

    if (hex.length === 6) {
      return `rgba(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(
        hex.slice(2, 4),
        16,
      )}, ${parseInt(hex.slice(4, 6), 16)}, ${alpha})`;
    }
  }

  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
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

const textStyleToCss = (styles?: Partial<StyledTextValue>) => {
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

const resolveCardImage = (
  value:
    | CardImageProps["image"]
    | ImageType
    | ComplexImageType
    | TranslatableAssetImage
    | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
) => {
  if (!value) {
    return undefined;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "field" in value &&
    "constantValueEnabled" in value
  ) {
    const resolved = resolveComponentData(value, locale, streamDocument);
    return resolveLocalizedAssetImage(
      resolved as ImageType | TranslatableAssetImage | undefined,
      locale,
    );
  }

  return resolveLocalizedAssetImage(
    value as ImageType | TranslatableAssetImage | undefined,
    locale,
  );
};

const ResourcesFields: YextFields<PersonalFinanceResourcesProps> = {
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
      cardSurface: {
        label: "Card Surface",
        type: "object",
        objectFields: {
          backgroundColor: {
            label: "Background Color",
            type: "basicSelector",
            options: "BACKGROUND_COLOR",
          },
        },
      },
      cards: resourceCardSource.field,
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

export const PersonalFinanceResourcesComponent: PuckComponent<
  PersonalFinanceResourcesProps
> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const cards = resourceCardSource.resolveItems(
    props.content.cards,
    streamDocument,
  );
  const cardSurfaceBackgroundColor = resolveThemeColor(
    props.content.cardSurface.backgroundColor,
    "#080e16",
  );
  const cardSurfaceOverlay = withAlpha(cardSurfaceBackgroundColor, 0.92);
  type ResolvedResourceCard = (typeof cards)[number];
  const rehydrateCta = (
    value: ResolvedResourceCard["primaryCta"],
  ): Partial<ComprehensiveCTAValue> => {
    const ctaValue = value as {
      data?: {
        cta?: unknown;
      };
    } & Partial<ComprehensiveCTAValue>;
    const resolvedCta = ctaValue.data?.cta;
    if (!resolvedCta) {
      return ctaValue;
    }

    const constantValue =
      typeof resolvedCta === "object" &&
      resolvedCta !== null &&
      "constantValue" in resolvedCta
        ? ((resolvedCta as { constantValue: unknown })
            .constantValue as EnhancedTranslatableCTA)
        : (resolvedCta as EnhancedTranslatableCTA);

    return {
      ...ctaValue,
      data: {
        ...ctaValue.data,
        actionType: ctaValue.data?.actionType ?? "link",
        cta: {
          field: "",
          constantValue,
          constantValueEnabled: true,
        },
        openInNewTab: ctaValue.data?.openInNewTab ?? false,
      },
    };
  };

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceResources${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          id="disclosures"
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
            <EntityField
              displayName="Resource Cards"
              fieldId={props.content.cards.field}
              constantValueEnabled={props.content.cards.constantValueEnabled}
            >
              <div className="grid items-start justify-center gap-5 lg:[grid-template-columns:repeat(2,minmax(320px,620px))]">
                {cards.map((card, index) => {
                  const primaryCtaField = (
                    props.content.cards.constantValueEnabled
                      ? props.content.cards.constantValue[index]?.primaryCta
                      : props.content.cards.mappings?.primaryCta
                  ) as ComprehensiveCTAValue | undefined;
                  const title =
                    typeof card.title === "string"
                      ? card.title
                      : resolvePlainText(
                          card.title,
                          locale,
                          streamDocument,
                          "Card title",
                        );
                  const image = resolveCardImage(
                    card.image,
                    locale,
                    streamDocument,
                  );
                  const imageWrapperStyle: React.CSSProperties & {
                    "--resource-card-aspect-ratio"?: string;
                  } = {
                    "--resource-card-aspect-ratio":
                      props.styles.image.aspectRatio > 0
                        ? String(props.styles.image.aspectRatio)
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
                  };
                  const descriptionStyles = {
                    ...props.styles.description.styles,
                    color: resolveThemeColor(
                      props.styles.description.fontColor,
                      "#f2f5f7",
                    ),
                  };
                  const resolvedDescription = resolveComponentData(
                    card.description ?? getDefaultRTF("Description"),
                    locale,
                    streamDocument,
                    { richTextStyleOverrides: descriptionStyles },
                  );
                  const titleColor = resolveThemeColor(
                    props.styles.title.fontColor,
                    "#ffffff",
                  );
                  const imageWrapperClassName =
                    props.styles.image.aspectRatio > 0
                      ? "col-start-1 row-start-1 h-full min-h-[280px] [aspect-ratio:auto] md:[aspect-ratio:var(--resource-card-aspect-ratio)]"
                      : "col-start-1 row-start-1 h-full min-h-[280px]";
                  const imageClassName =
                    props.styles.image.imageConstrain === "filled"
                      ? "h-full w-full object-cover"
                      : "h-full w-full object-cover md:object-contain";

                  return (
                    <article
                      key={`${title}-${index}`}
                      className="relative grid w-full self-start overflow-hidden rounded-[16px] shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                      style={{ backgroundColor: cardSurfaceBackgroundColor }}
                    >
                      {hasImageSource(image) && image ? (
                        <div
                          className={imageWrapperClassName}
                          style={imageWrapperStyle}
                        >
                          <Image
                            image={image}
                            className={imageClassName}
                            style={imageStyle}
                          />
                        </div>
                      ) : null}
                      <div
                        className="pointer-events-none col-start-1 row-start-1 min-h-[280px] h-full"
                        style={{
                          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(8,14,22,0.12) 34%, ${cardSurfaceOverlay} 100%)`,
                        }}
                      />
                      <div className="col-start-1 row-start-1 flex min-h-[280px] flex-col justify-end p-6 md:min-h-0">
                        <h3
                          className="text-[1.35rem] font-semibold"
                          style={{
                            color: titleColor,
                            ...textStyleToCss(props.styles.title.styles),
                          }}
                        >
                          {title}
                        </h3>
                        <>
                          {React.isValidElement(resolvedDescription) ? (
                            resolvedDescription
                          ) : (
                            <MaybeRTF
                              data={normalizeResolvedRichText(
                                resolvedDescription,
                              )}
                              className="mt-3 max-w-[560px] text-sm leading-7"
                              richTextStyleOverrides={descriptionStyles}
                            />
                          )}
                        </>
                        {card.primaryCta ? (
                          <div className="mt-5">
                            <EntityField
                              displayName={`Resource ${index + 1} Primary CTA`}
                              fieldId={primaryCtaField?.data.cta.field}
                              constantValueEnabled={
                                primaryCtaField?.data.cta.constantValueEnabled
                              }
                            >
                              <ComprehensiveCTA
                                value={rehydrateCta(card.primaryCta)}
                                className="inline-flex min-h-[42px] items-center rounded-[10px] px-6 py-2.5 text-sm font-bold"
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

export const PersonalFinanceResources: YextComponentConfig<PersonalFinanceResourcesProps> =
  {
    label: "Resources",
    fields: ResourcesFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#ececef]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        cardSurface: {
          backgroundColor: {
            selectedColor: "palette-primary",
            contrastingColor: "palette-primary-contrast",
          },
        },
        cards: resourceCardSource.defaultValue,
      },
      styles: {
        image: {
          aspectRatio: 1.5,
          imageConstrain: "filled",
          styles: defaultImageStyle,
        },
        title: createStyledTextDefault("Title"),
        description: createStyledRtfDefault("Description"),
      },
    },
    render: PersonalFinanceResourcesComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceResources",
  displayName: "Resources",
  description: "Resources",
  pageSetTypes: ["ENTITY"],
};
