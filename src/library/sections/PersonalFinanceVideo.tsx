import type { SectionConfig } from "@yext/visual-editor";

import {
  aspectRatioOptions,
  createRichTextField,
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
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
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

const typographyScopeClass = "yextPersonalFinanceVideoTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

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

const imageStyleToCss = (styles?: Partial<StyledImageValue>): CSSProperties => {
  return {
    borderRadius: isDefaultToken(styles?.borderRadius)
      ? undefined
      : styles?.borderRadius,
  };
};

const VideoFields: YextFields<PersonalFinanceVideoProps> = {
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
      sectionHeading: {
        label: msg("fields.sectionHeading", "Section Heading"),
        type: "object",
        objectFields: {
          text: createTextField(msg("fields.text", "Text")),
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      sectionDescription: {
        label: msg("fields.sectionDescription", "Section Description"),
        type: "object",
        objectFields: {
          text: createRichTextField(msg("fields.text", "Text")),
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      videoUrl: {
        label: msg("fields.videoURL", "Video URL"),
        type: "text",
      },
      posterImage: {
        label: msg("fields.posterImage", "Poster Image"),
        type: "object",
        objectFields: {
          image: createImageField(msg("fields.image", "Image")),
          aspectRatio: {
            type: "basicSelector" as const,
            label: msg("fields.aspectRatio", "Aspect Ratio"),
            options: aspectRatioOptions,
          },
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
      posterCaption: {
        label: msg("fields.posterCaption", "Poster Caption"),
        type: "object",
        objectFields: {
          text: createRichTextField(msg("fields.text", "Text")),
          styles: {
            label: msg("fields.textStyles", "Text Styles"),
            type: "styledText",
          },
          fontColor: {
            label: msg("fields.fontColor", "Font Color"),
            type: "basicSelector",
            options: "SITE_COLOR",
          },
        },
      },
      videoFrame: {
        label: msg("fields.videoFrame", "Video Frame"),
        type: "object",
        objectFields: {
          backgroundColor: {
            label: msg("fields.backgroundColor", "Background Color"),
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
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
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
  const videoFrameStyle = getSurfaceColorStyle(
    props.content.videoFrame.backgroundColor,
    streamDocument,
  );
  const captionOverrides = {
    ...props.content.posterCaption.styles,
    color: props.content.posterCaption.fontColor
      ? resolveThemeColor(props.content.posterCaption.fontColor)
      : (videoFrameStyle?.color ?? sectionForeground),
  };
  const resolvedDescription = resolveComponentData(
    props.content.sectionDescription.text,
    locale,
    streamDocument,
  );
  const resolvedCaption = resolveComponentData(
    props.content.posterCaption.text,
    locale,
    streamDocument,
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
            <Background
              as="div"
              background={props.content.videoFrame.backgroundColor}
              className="mx-auto max-w-[1160px] overflow-hidden rounded-[20px] border border-black/5 shadow-[0_8px_26px_rgba(9,30,66,0.08)]"
              style={videoFrameStyle}
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
            </Background>
          </div>
        </Background>
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
