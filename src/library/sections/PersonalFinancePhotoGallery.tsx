import type { SectionConfig } from "@yext/visual-editor";

import {
  aspectRatioOptions,
  createEntityText,
  createStyledRtfDefault,
  createStyledRtfField,
  createStyledTextDefault,
  createStyledTextField,
  createTextField,
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
  EntityField,
  Image,
  MaybeRTF,
  createItemSource,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
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

const typographyScopeClass = "yextPersonalFinancePhotoGalleryTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const defaultImageStyle: StyledImageValue = {
  borderRadius: "default",
};

const galleryDefaults = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
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
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  const gallerySurfaceStyle = getSurfaceColorStyle(
    props.gallerySurfaceBackgroundColor,
    streamDocument,
  );
  const galleryForegroundColor =
    gallerySurfaceStyle?.color ?? sectionForegroundColor;
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
                    <Background
                      as="div"
                      background={props.gallerySurfaceBackgroundColor}
                      key={`${caption}-${index}`}
                      className="overflow-hidden rounded-[16px] border border-black/5 shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                      style={gallerySurfaceStyle}
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
                    </Background>
                  );
                })}
              </EntityField>
            </div>
          </div>
        </Background>
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
