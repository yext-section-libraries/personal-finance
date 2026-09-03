import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  Image,
  MaybeRTF,
  resolveComponentData,
  resolveLocalizedAssetImage,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type EntityFieldSelectorField,
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

type PosterImageProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type VideoContent = {
  sectionHeading: StyledTextProps;
  sectionDescription: StyledRtfProps;
  videoUrl: string;
  posterImage: PosterImageProps;
  posterCaption: StyledRtfProps;
  videoFrame: {
    backgroundColor: ThemeColor;
  };
};

type PersonalFinanceVideoProps = {
  section: SectionTheme;
  content: VideoContent;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceVideoTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceVideoTypographyScope p,
.yextPersonalFinanceVideoTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceVideoTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceVideoTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceVideoTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceVideoTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceVideoTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceVideoTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceVideoTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceVideoTypographyScope a:hover {
  text-decoration: underline;
}
`;

const defaultImageStyle: StyledImageValue = {
  borderRadius: "default",
};

const defaultPoster =
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80";
const defaultEmbedUrl = "https://www.youtube.com/embed/ysz5S6PUM-U";

const createEditableText = (
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

const createEditableRichText = (
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

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const resolvePlainText = (
  value: YextEntityField<TranslatableString> | undefined,
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

const resolvePosterImage = (
  value: PosterImageProps | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
) => {
  if (!value) {
    return undefined;
  }

  const resolved = resolveComponentData(value.image, locale, streamDocument);
  const image = resolveLocalizedAssetImage(resolved, locale);
  return hasImageSource(image) ? image : undefined;
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

const VideoFields: YextFields<PersonalFinanceVideoProps> = {
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
      sectionHeading: {
        label: "Section Heading",
        type: "object",
        objectFields: {
          text: createTextField("Text"),
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      sectionDescription: {
        label: "Section Description",
        type: "object",
        objectFields: {
          text: createRichTextField("Text"),
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      videoUrl: {
        label: "Video URL",
        type: "text",
      },
      posterImage: {
        label: "Poster Image",
        type: "object",
        objectFields: {
          image: createImageField("Image"),
          aspectRatio: {
            type: "basicSelector" as const,
            label: "Aspect Ratio",
            options: "ASPECT_RATIO" as const,
          },
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
      posterCaption: {
        label: "Poster Caption",
        type: "object",
        objectFields: {
          text: createRichTextField("Text"),
          styles: {
            label: "Text Styles",
            type: "styledText",
          },
          fontColor: {
            label: "Font Color",
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      videoFrame: {
        label: "Video Frame",
        type: "object",
        objectFields: {
          backgroundColor: {
            label: "Background Color",
            type: "basicSelector",
            options: "BACKGROUND_COLOR",
          },
        },
      },
    },
  },
};

export const PersonalFinanceVideoComponent: PuckComponent<
  PersonalFinanceVideoProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale =
    typeof streamDocument?.locale === "string" ? streamDocument.locale : "en";
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const headingColor = resolveThemeColor(
    props.content.sectionHeading.fontColor,
    sectionForeground,
  );
  const descriptionOverrides = {
    ...props.content.sectionDescription.styles,
    color: props.content.sectionDescription.fontColor
      ? resolveThemeColor(props.content.sectionDescription.fontColor)
      : sectionForeground,
  };
  const captionOverrides = {
    ...props.content.posterCaption.styles,
    color: props.content.posterCaption.fontColor
      ? resolveThemeColor(props.content.posterCaption.fontColor)
      : sectionForeground,
  };
  const resolvedDescription = resolveComponentData(
    props.content.sectionDescription.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: descriptionOverrides,
    },
  );
  const resolvedCaption = resolveComponentData(
    props.content.posterCaption.text,
    locale,
    streamDocument,
    {
      richTextStyleOverrides: captionOverrides,
    },
  );
  const posterImage = resolvePosterImage(
    props.content.posterImage,
    locale,
    streamDocument,
  );
  const posterImageWrapperStyle: React.CSSProperties = {
    aspectRatio:
      props.content.posterImage.aspectRatio > 0
        ? props.content.posterImage.aspectRatio
        : undefined,
    borderRadius: imageStyleToCss(props.content.posterImage.styles)
      .borderRadius,
    overflow:
      props.content.posterImage.imageConstrain === "filled" ||
      Boolean(
        props.content.posterImage.styles?.borderRadius &&
        props.content.posterImage.styles.borderRadius !== "default",
      )
        ? "hidden"
        : undefined,
  };
  const posterImageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: props.content.posterImage.aspectRatio > 0 ? "100%" : "auto",
    objectFit:
      props.content.posterImage.imageConstrain === "filled"
        ? "cover"
        : "contain",
  };
  const descriptionContent = React.isValidElement(resolvedDescription) ? (
    resolvedDescription
  ) : (
    <MaybeRTF
      data={normalizeResolvedRichText(resolvedDescription)}
      className="mt-3 text-sm leading-7"
      richTextStyleOverrides={descriptionOverrides}
    />
  );
  const captionContent = React.isValidElement(resolvedCaption) ? (
    resolvedCaption
  ) : (
    <MaybeRTF
      data={normalizeResolvedRichText(resolvedCaption)}
      className="px-6 py-5 text-sm leading-7"
      richTextStyleOverrides={captionOverrides}
    />
  );
  const videoUrl = props.content.videoUrl.trim();

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceVideo${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={{
            backgroundColor: resolveThemeColor(
              props.section.backgroundColor,
              "#ffffff",
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
                    color: headingColor,
                    ...textStyleToCss(props.content.sectionHeading.styles),
                  }}
                >
                  {resolvePlainText(
                    props.content.sectionHeading.text,
                    locale,
                    streamDocument,
                    "Hear From the Team",
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
                {descriptionContent}
              </EntityField>
            </div>
            <div
              className="mx-auto max-w-[1160px] overflow-hidden rounded-[20px] border border-black/5 shadow-[0_8px_26px_rgba(9,30,66,0.08)]"
              style={{
                backgroundColor: resolveThemeColor(
                  props.content.videoFrame.backgroundColor,
                  "#ffffff",
                ),
              }}
            >
              {videoUrl ? (
                <div className="aspect-video w-full">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                    src={videoUrl}
                    title={resolvePlainText(
                      props.content.sectionHeading.text,
                      locale,
                      streamDocument,
                      "Video",
                    )}
                  />
                </div>
              ) : hasImageSource(posterImage) && posterImage ? (
                <figure>
                  <EntityField
                    displayName="Poster Image"
                    fieldId={props.content.posterImage.image.field}
                    constantValueEnabled={
                      props.content.posterImage.image.constantValueEnabled
                    }
                  >
                    <div style={posterImageWrapperStyle}>
                      <Image
                        image={posterImage}
                        className="h-[260px] w-full md:h-[560px]"
                        style={posterImageStyle}
                      />
                    </div>
                  </EntityField>
                  <EntityField
                    displayName="Poster Caption"
                    fieldId={props.content.posterCaption.text.field}
                    constantValueEnabled={
                      props.content.posterCaption.text.constantValueEnabled
                    }
                  >
                    {captionContent}
                  </EntityField>
                </figure>
              ) : null}
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceVideo: YextComponentConfig<PersonalFinanceVideoProps> =
  {
    label: "Video",
    fields: VideoFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: {
          text: createEditableText("Hear From the Team"),
          styles: defaultTextStyle,
        },
        sectionDescription: {
          text: createEditableRichText(
            "Use this section for a welcome video, a planning explainer, or a short brand story that complements the calm, editorial look of the template.",
          ),
          styles: defaultTextStyle,
        },
        videoUrl: defaultEmbedUrl,
        posterImage: {
          image: {
            field: "",
            constantValue: {
              url: defaultPoster,
              width: 1400,
              height: 933,
            },
            constantValueEnabled: true,
          },
          aspectRatio: 2.071,
          imageConstrain: "filled",
          styles: defaultImageStyle,
        },
        posterCaption: {
          text: createEditableRichText(
            "Swap the default embed for a team introduction, office walkthrough, or planning primer video.",
          ),
          styles: defaultTextStyle,
        },
        videoFrame: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
        },
      },
    },
    render: PersonalFinanceVideoComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceVideo",
  displayName: "Video",
  description: "Video",
  pageSetTypes: ["ENTITY"],
};
