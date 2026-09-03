import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
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
  type EntityFieldSelectorField,
  type StyledImageValue,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
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

type GalleryImageField = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type GalleryPhoto = {
  image: YextEntityField<TranslatableAssetImage>;
  caption: YextEntityField<TranslatableString>;
};

type GalleryStyles = {
  image: Omit<GalleryImageField, "image">;
  caption: Omit<StyledTextProps, "text">;
};

type GalleryContent = {
  sectionHeading: StyledTextProps;
  sectionDescription: StyledRtfProps;
  photos: typeof galleryPhotoSource.value;
};

type PersonalFinancePhotoGalleryProps = {
  section: SectionTheme;
  content: GalleryContent;
  gallerySurfaceBackgroundColor: ThemeColor;
  galleryStyles: GalleryStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinancePhotoGalleryTypographyScope";
const typographyScopeCss = `
.yextPersonalFinancePhotoGalleryTypographyScope p,
.yextPersonalFinancePhotoGalleryTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinancePhotoGalleryTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinancePhotoGalleryTypographyScope a:hover {
  text-decoration: underline;
}
`;

const defaultImageStyle: StyledImageValue = {
  borderRadius: "default",
};

const galleryDefaults = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
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
  width: number,
  height: number,
): YextEntityField<TranslatableAssetImage> => ({
  field: "",
  constantValue: { url, width, height },
  constantValueEnabled: true,
});

const galleryPhotoSource = createItemSource<GalleryPhoto>({
  label: "Photos",
  mappingFields: {
    image: createImageField("Image"),
    caption: createTextField("Caption"),
  },
  defaultValues: [
    {
      image: createDefaultImageValue(galleryDefaults[0], 1200, 800),
      caption: createEntityText(
        "Welcoming reception spaces designed for calm, focused conversations.",
      ),
    },
    {
      image: createDefaultImageValue(galleryDefaults[1], 1200, 800),
      caption: createEntityText(
        "Private meeting rooms for wealth planning and advisory sessions.",
      ),
    },
    {
      image: createDefaultImageValue(galleryDefaults[2], 1200, 800),
      caption: createEntityText(
        "Collaborative spaces where clients and advisors can work through planning details.",
      ),
    },
    {
      image: createDefaultImageValue(galleryDefaults[3], 1200, 800),
      caption: createEntityText(
        "Bright, professional interiors that reflect the [[name]] brand aesthetic.",
      ),
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

const imageStyleToCss = (styles?: Partial<StyledImageValue>): CSSProperties => {
  return {
    borderRadius: isDefaultToken(styles?.borderRadius)
      ? undefined
      : styles?.borderRadius,
  };
};

const resolveGalleryImage = (
  value: TranslatableAssetImage | undefined,
  locale: string,
) => {
  if (!value) {
    return undefined;
  }

  const image = resolveLocalizedAssetImage(value, locale);
  return hasImageSource(image) ? image : undefined;
};

const GalleryFields: YextFields<PersonalFinancePhotoGalleryProps> = {
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
      photos: galleryPhotoSource.field,
    },
  },
  gallerySurfaceBackgroundColor: {
    label: "Gallery Surface Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  galleryStyles: {
    label: "Gallery Styles",
    type: "object",
    objectFields: {
      image: createImageStyleField("Image"),
      caption: createStyledTextField("Caption"),
    },
  },
};

export const PersonalFinancePhotoGalleryComponent: PuckComponent<
  PersonalFinancePhotoGalleryProps
> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const sectionForegroundColor = resolveThemeColor(
    sectionForeground,
    "#1a1a1a",
  );
  const galleryForegroundColor = resolveThemeColor(
    props.gallerySurfaceBackgroundColor?.contrastingColor,
    sectionForegroundColor,
  );
  const descriptionOverrides = {
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
    {
      richTextStyleOverrides: descriptionOverrides,
    },
  );
  const photos = galleryPhotoSource.resolveItems(
    props.content.photos,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinancePhotoGallery${getAnalyticsScopeHash(props.id)}`}
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
                    "Inside Our [[address.city]] Office",
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
                    richTextStyleOverrides={descriptionOverrides}
                  />
                )}
              </EntityField>
            </div>
            <div className="grid justify-center gap-5 md:grid-cols-2 xl:grid-cols-4">
              <EntityField
                displayName="Photos"
                fieldId={props.content.photos.field}
                constantValueEnabled={props.content.photos.constantValueEnabled}
              >
                {photos.map((photo, index) => {
                  const caption = resolvePlainText(
                    photo.caption,
                    locale,
                    streamDocument,
                    "Gallery caption",
                  );
                  const image = resolveGalleryImage(photo.image, locale);
                  const imageWrapperStyle: React.CSSProperties = {
                    aspectRatio:
                      props.galleryStyles.image.aspectRatio > 0
                        ? props.galleryStyles.image.aspectRatio
                        : undefined,
                    overflow:
                      props.galleryStyles.image.imageConstrain === "filled" ||
                      Boolean(
                        props.galleryStyles.image.styles?.borderRadius &&
                        props.galleryStyles.image.styles.borderRadius !==
                          "default",
                      )
                        ? "hidden"
                        : undefined,
                  };
                  const imageStyle: React.CSSProperties = {
                    display: "block",
                    width: "100%",
                    height:
                      props.galleryStyles.image.aspectRatio > 0
                        ? "100%"
                        : "auto",
                    objectFit:
                      props.galleryStyles.image.imageConstrain === "filled"
                        ? "cover"
                        : "contain",
                    ...imageStyleToCss(props.galleryStyles.image.styles),
                  };

                  return (
                    <figure
                      key={`${caption}-${index}`}
                      className="overflow-hidden rounded-[16px] border border-black/5 shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                      style={{
                        backgroundColor: resolveThemeColor(
                          props.gallerySurfaceBackgroundColor,
                          "#ffffff",
                        ),
                      }}
                    >
                      {hasImageSource(image) && image ? (
                        <div style={imageWrapperStyle}>
                          <Image
                            image={image}
                            className="h-[240px] w-full"
                            style={imageStyle}
                          />
                        </div>
                      ) : null}
                      <figcaption
                        className="px-5 py-4 text-sm leading-6"
                        style={{
                          color: resolveThemeColor(
                            props.galleryStyles.caption.fontColor,
                            galleryForegroundColor,
                          ),
                          ...textStyleToCss(props.galleryStyles.caption.styles),
                        }}
                      >
                        {caption}
                      </figcaption>
                    </figure>
                  );
                })}
              </EntityField>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinancePhotoGallery: YextComponentConfig<PersonalFinancePhotoGalleryProps> =
  {
    label: "Photo Gallery",
    fields: GalleryFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault(
          "Inside Our [[address.city]] Office",
        ),
        sectionDescription: createStyledRtfDefault(
          "Share a visual tour of the office, meeting spaces, and client experience with a gallery that fits the same calm, editorial tone as the rest of the page.",
        ),
        photos: galleryPhotoSource.defaultValue,
      },
      gallerySurfaceBackgroundColor: {
        selectedColor: "white",
        contrastingColor: "black",
      },
      galleryStyles: {
        image: {
          aspectRatio: 3 / 2,
          imageConstrain: "filled",
          styles: defaultImageStyle,
        },
        caption: createStyledTextDefault("Gallery caption"),
      },
    },
    render: PersonalFinancePhotoGalleryComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinancePhotoGallery",
  displayName: "Photo Gallery",
  description: "Photo Gallery",
  pageSetTypes: ["ENTITY"],
};
