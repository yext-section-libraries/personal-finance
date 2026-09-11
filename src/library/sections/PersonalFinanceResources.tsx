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
  Background,
  ComprehensiveCTA,
  EntityField,
  Image,
  MaybeRTF,
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

const typographyScopeClass = "yextPersonalFinanceResourcesTypographyScope";
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
        options: aspectRatioOptions,
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
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const cardSurfaceStyle = getSurfaceColorStyle(
    props.content.cardSurface.backgroundColor,
    streamDocument,
  );
  const cardSurfaceBackgroundColor =
    cardSurfaceStyle?.backgroundColor ?? "#080e16";
  const cardSurfaceForegroundColor = cardSurfaceStyle?.color ?? "#ffffff";
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
        <Background
          as="section"
          background={props.section.backgroundColor}
          id="disclosures"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={sectionStyle}
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
                  );
                  const titleColor = resolveThemeColor(
                    props.styles.title.fontColor,
                    cardSurfaceForegroundColor,
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
                    <Background
                      as="div"
                      background={props.content.cardSurface.backgroundColor}
                      key={`${title}-${index}`}
                      className="relative grid w-full self-start overflow-hidden rounded-[16px] shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                      style={cardSurfaceStyle}
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
