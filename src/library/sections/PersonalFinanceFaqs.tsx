import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  MaybeRTF,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
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

const resolveThemeColor = (
  color?: ThemeColorInput,
  fallback = "#ffffff",
): string => {
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

const defaultReadableTextColor: ThemeColor = {
  selectedColor: "default",
  contrastingColor: "black",
};

const isDefaultColorSelection = (color?: ThemeColorInput): boolean => {
  const selectedColor =
    typeof color === "string" ? color : color?.selectedColor;
  return !selectedColor || selectedColor === "default";
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

type FaqItem = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

type FaqStyles = {
  question: Omit<StyledTextProps, "text">;
  answer: Omit<StyledRtfProps, "text">;
};

type FaqsContent = {
  sectionHeading: StyledTextProps;
  items: typeof faqItemSource.value;
};

type PersonalFinanceFaqsProps = {
  section: SectionTheme;
  content: FaqsContent;
  faqStyles: FaqStyles;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceFaqsTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceFaqsTypographyScope p,
.yextPersonalFinanceFaqsTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceFaqsTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceFaqsTypographyScope a:hover {
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

const faqItemSource = createItemSource<FaqItem>({
  label: "FAQs",
  mappingFields: {
    question: createTextField("Question"),
    answer: createRichTextField("Answer"),
  },
  defaultValues: [
    {
      question: createEntityText(
        "Do I need an appointment to visit this office?",
      ),
      answer: createEntityRichText(
        "Appointments are recommended for financial planning and advisory meetings, but clients can still stop by during lobby hours for basic banking support or questions.",
      ),
    },
    {
      question: createEntityText("Is parking available nearby?"),
      answer: createEntityRichText(
        "Yes. Nearby public and garage parking options are available throughout the South Tryon and [[geomodifier]] [[address.city]] area.",
      ),
    },
    {
      question: createEntityText("Can I meet with an advisor virtually?"),
      answer: createEntityRichText(
        "Yes. Virtual planning sessions are available for clients who prefer remote consultations or follow-up meetings.",
      ),
    },
    {
      question: createEntityText(
        "What languages are supported at this office?",
      ),
      answer: createEntityRichText(
        "English, Spanish, Chinese, and French support are available for select appointments and follow-up conversations.",
      ),
    },
    {
      question: createEntityText(
        "Is this office accessible by public transit?",
      ),
      answer: createEntityRichText(
        "Yes. The office is located close to multiple [[geomodifier]] [[address.city]] transit stops and offers elevator access from the building lobby.",
      ),
    },
  ],
});

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const resolvePlainText = (
  value: YextEntityField<TranslatableString> | TranslatableString | undefined,
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

const resolveRtfValue = (
  value:
    YextEntityField<TranslatableRichText> | TranslatableRichText | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
  richTextStyleOverrides: Record<string, unknown>,
) => {
  if (!value) {
    return undefined;
  }

  return resolveComponentData(value, locale, streamDocument, {
    richTextStyleOverrides,
  });
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

const SectionFields: YextFields<PersonalFinanceFaqsProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  content: {
    label: "Content",
    type: "object",
    objectFields: {
      sectionHeading: createStyledTextField("Heading"),
      items: faqItemSource.field,
    },
  },
  faqStyles: {
    label: "FAQ Styles",
    type: "object",
    objectFields: {
      question: createStyledTextField("Question"),
      answer: createStyledRtfField("Answer"),
    },
  },
};

export const PersonalFinanceFaqsComponent: PuckComponent<
  PersonalFinanceFaqsProps
> = (props) => {
  const [openIndex, setOpenIndex] = React.useState(0);
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const items = faqItemSource.resolveItems(props.content.items, streamDocument);

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceFaqs${getAnalyticsScopeHash(props.id)}`}
      >
        <section
          id="faqs"
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
            <div className="mx-auto mb-8 max-w-[780px] text-center">
              <EntityField
                displayName="Heading"
                fieldId={props.content.sectionHeading.text.field}
                constantValueEnabled={
                  props.content.sectionHeading.text.constantValueEnabled
                }
              >
                <h2
                  className="text-[2.2rem] font-bold tracking-[-0.04em]"
                  style={{
                    ...textStyleToCss(props.content.sectionHeading.styles),
                    color: resolveThemeColor(
                      props.content.sectionHeading.fontColor ??
                        sectionForeground,
                      "#1a1a1a",
                    ),
                  }}
                >
                  {resolvePlainText(
                    props.content.sectionHeading.text,
                    locale,
                    streamDocument,
                    "Frequently Asked Questions",
                  )}
                </h2>
              </EntityField>
            </div>
            <div className="mx-auto max-w-[980px] divide-y divide-black/10 border-y border-black/10">
              <EntityField
                displayName="FAQs"
                fieldId={props.content.items.field}
                constantValueEnabled={props.content.items.constantValueEnabled}
              >
                <>
                  {items.map((item, index) => {
                    const open = index === openIndex;
                    const questionColor = resolveThemeColor(
                      isDefaultColorSelection(
                        props.faqStyles.question.fontColor,
                      )
                        ? sectionForeground
                        : props.faqStyles.question.fontColor,
                      "#1a1a1a",
                    );
                    const answerStyles = {
                      ...props.faqStyles.answer.styles,
                      color: resolveThemeColor(
                        props.faqStyles.answer.fontColor,
                        sectionForeground,
                      ),
                    };
                    const resolvedAnswer = resolveRtfValue(
                      item.answer ?? getDefaultRTF("Answer"),
                      locale,
                      streamDocument,
                      answerStyles,
                    );

                    return (
                      <div key={index} className="py-5">
                        <button
                          aria-expanded={open}
                          className="flex w-full items-start justify-between gap-6 text-left"
                          onClick={() => setOpenIndex(open ? -1 : index)}
                          type="button"
                        >
                          <span
                            className="text-sm font-semibold"
                            style={{
                              ...textStyleToCss(
                                props.faqStyles.question.styles,
                              ),
                              color: questionColor,
                            }}
                          >
                            {resolvePlainText(
                              item.question,
                              locale,
                              streamDocument,
                              "Question",
                            )}
                          </span>
                          <span
                            className="pt-0.5 text-lg leading-none"
                            style={{ color: questionColor }}
                          >
                            {open ? "−" : "+"}
                          </span>
                        </button>
                        {open ? (
                          <div className="mt-4 max-w-[880px] text-sm leading-7">
                            {React.isValidElement(resolvedAnswer) ? (
                              resolvedAnswer
                            ) : (
                              <MaybeRTF
                                data={normalizeResolvedRichText(resolvedAnswer)}
                                richTextStyleOverrides={answerStyles}
                              />
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </>
              </EntityField>
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceFaqs: YextComponentConfig<PersonalFinanceFaqsProps> =
  {
    label: "FAQs",
    fields: SectionFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Frequently Asked Questions"),
        items: faqItemSource.defaultValue,
      },
      faqStyles: {
        question: createStyledTextDefault("Question", defaultReadableTextColor),
        answer: createStyledRtfDefault("Answer"),
      },
    },
    render: PersonalFinanceFaqsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceFaqs",
  displayName: "FAQs",
  description: "FAQs",
  pageSetTypes: ["ENTITY"],
};
