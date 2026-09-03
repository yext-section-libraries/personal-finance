import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  MaybeRTF,
  resolveComponentData,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type EntityFieldSelectorField,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
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

type TestimonialItem = {
  quote: YextEntityField<TranslatableRichText>;
  name: YextEntityField<TranslatableString>;
  role: YextEntityField<TranslatableString>;
};

type TestimonialStyles = {
  quote: Omit<StyledRtfProps, "text">;
  name: Omit<StyledTextProps, "text">;
  role: Omit<StyledTextProps, "text">;
};

type TestimonialsContent = {
  sectionHeading: StyledTextProps;
  testimonials: typeof testimonialSource.value;
};

type PersonalFinanceTestimonialsProps = {
  section: SectionTheme;
  content: TestimonialsContent;
  testimonialStyles: TestimonialStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceTestimonialsTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceTestimonialsTypographyScope p,
.yextPersonalFinanceTestimonialsTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceTestimonialsTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceTestimonialsTypographyScope a:hover {
  text-decoration: underline;
}
`;

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

const testimonialSource = createItemSource<TestimonialItem>({
  label: "Testimonials",
  mappingFields: {
    quote: createRichTextField("Quote"),
    name: createTextField("Name"),
    role: createTextField("Role"),
  },
  defaultValues: [
    {
      quote: createEntityRichText(
        "The [[geomodifier]] [[address.city]] team helped us understand our retirement timeline and organize the next steps with clarity.",
      ),
      name: createEntityText("Denise Carter"),
      role: createEntityText("Client"),
    },
    {
      quote: createEntityRichText(
        "We appreciated how personalized the advice felt from the first meeting through our follow-up planning sessions.",
      ),
      name: createEntityText("Marco Johnson"),
      role: createEntityText("Client"),
    },
    {
      quote: createEntityRichText(
        "They made long-term financial planning feel approachable and gave us a path forward we could act on immediately.",
      ),
      name: createEntityText("Sonia Patel"),
      role: createEntityText("Client"),
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

const TestimonialsFields: YextFields<PersonalFinanceTestimonialsProps> = {
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
      testimonials: testimonialSource.field,
    },
  },
  testimonialStyles: {
    label: "Testimonial Styles",
    type: "object",
    objectFields: {
      quote: createStyledRtfField("Quote"),
      name: createStyledTextField("Name"),
      role: createStyledTextField("Role"),
    },
  },
};

export const PersonalFinanceTestimonialsComponent: PuckComponent<
  PersonalFinanceTestimonialsProps
> = (props) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const testimonials = testimonialSource.resolveItems(
    props.content.testimonials,
    streamDocument,
  );
  const testimonialCount = testimonials.length;
  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];
  const sectionForeground = props.section.backgroundColor.contrastingColor;

  if (!activeTestimonial) {
    return <div />;
  }

  const resolvedQuote = resolveComponentData(
    activeTestimonial.quote ?? getDefaultRTF("Quote"),
    locale,
    streamDocument,
    {
      richTextStyleOverrides: {
        ...props.testimonialStyles.quote.styles,
        color: resolveThemeColor(
          props.testimonialStyles.quote.fontColor,
          sectionForeground,
        ),
      },
    },
  );
  const quoteContent = React.isValidElement(resolvedQuote) ? (
    resolvedQuote
  ) : (
    <MaybeRTF
      data={normalizeResolvedRichText(resolvedQuote)}
      richTextStyleOverrides={{
        ...props.testimonialStyles.quote.styles,
        color: resolveThemeColor(
          props.testimonialStyles.quote.fontColor,
          sectionForeground,
        ),
      }}
    />
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceTestimonials${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          id="testimonials"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={{
            backgroundColor: resolveThemeColor(
              props.section.backgroundColor,
              "#ececef",
            ),
          }}
        >
          <style>{typographyScopeCss}</style>
          <div className="mx-auto max-w-[1410px] px-6">
            <div className="mx-auto max-w-[780px] text-center">
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
                    "Testimonials",
                  )}
                </h2>
              </EntityField>
            </div>
            <div className="relative mx-auto mt-8 max-w-[980px] text-center">
              <div className="mb-6 flex justify-center gap-3 md:hidden">
                <button
                  aria-label="Previous testimonial"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-xl"
                  style={{ color: "#555555" }}
                  onClick={() =>
                    setActiveIndex((value) =>
                      value === 0 ? testimonialCount - 1 : value - 1,
                    )
                  }
                  type="button"
                >
                  ←
                </button>
                <button
                  aria-label="Next testimonial"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-xl"
                  style={{ color: "#555555" }}
                  onClick={() =>
                    setActiveIndex((value) =>
                      value === testimonialCount - 1 ? 0 : value + 1,
                    )
                  }
                  type="button"
                >
                  →
                </button>
              </div>
              <button
                aria-label="Previous testimonial"
                className="absolute left-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-xl md:flex"
                style={{ color: "#555555" }}
                onClick={() =>
                  setActiveIndex((value) =>
                    value === 0 ? testimonialCount - 1 : value - 1,
                  )
                }
                type="button"
              >
                ←
              </button>
              <button
                aria-label="Next testimonial"
                className="absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-xl md:flex"
                style={{ color: "#555555" }}
                onClick={() =>
                  setActiveIndex((value) =>
                    value === testimonialCount - 1 ? 0 : value + 1,
                  )
                }
                type="button"
              >
                →
              </button>
              <EntityField
                displayName="Testimonials"
                fieldId={props.content.testimonials.field}
                constantValueEnabled={
                  props.content.testimonials.constantValueEnabled
                }
              >
                <>
                  <blockquote
                    className="mx-auto max-w-[760px] px-0 text-[1.7rem] italic leading-[1.45] tracking-[-0.02em] md:px-14 md:text-[2.1rem]"
                    style={textStyleToCss(props.testimonialStyles.quote.styles)}
                  >
                    <span aria-hidden="true">“</span>
                    {quoteContent}
                    <span aria-hidden="true">”</span>
                  </blockquote>
                  <div className="mt-8">
                    <div
                      className="text-[1.05rem] font-semibold"
                      style={{
                        color: resolveThemeColor(
                          props.testimonialStyles.name.fontColor,
                          sectionForeground,
                        ),
                        ...textStyleToCss(props.testimonialStyles.name.styles),
                      }}
                    >
                      {resolvePlainText(
                        activeTestimonial.name,
                        locale,
                        streamDocument,
                        "Name",
                      )}
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: resolveThemeColor(
                          props.testimonialStyles.role.fontColor,
                          sectionForeground,
                        ),
                        ...textStyleToCss(props.testimonialStyles.role.styles),
                      }}
                    >
                      {resolvePlainText(
                        activeTestimonial.role,
                        locale,
                        streamDocument,
                        "Role",
                      )}
                    </div>
                  </div>
                </>
              </EntityField>
              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={`${resolvePlainText(testimonial.name, locale, streamDocument, `testimonial-${index}`)}-${index}`}
                    aria-label={`Show testimonial ${index + 1}`}
                    className={`h-2.5 w-2.5 rounded-full ${
                      index === activeIndex ? "" : "bg-[#b6b6bc]"
                    }`}
                    style={
                      index === activeIndex
                        ? {
                            backgroundColor: resolveThemeColor(
                              props.testimonialStyles.name.fontColor,
                              "#1a1a1a",
                            ),
                          }
                        : undefined
                    }
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceTestimonials: YextComponentConfig<PersonalFinanceTestimonialsProps> =
  {
    label: "Testimonials",
    fields: TestimonialsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Testimonials"),
        testimonials: testimonialSource.defaultValue,
      },
      testimonialStyles: {
        quote: createStyledRtfDefault("Quote"),
        name: createStyledTextDefault("Name"),
        role: createStyledTextDefault("Role"),
      },
    },
    render: PersonalFinanceTestimonialsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceTestimonials",
  displayName: "Testimonials",
  description: "Testimonials",
  pageSetTypes: ["ENTITY"],
};
