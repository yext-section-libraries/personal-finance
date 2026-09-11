import type { SectionConfig } from "@yext/visual-editor";

import {
  createEntityRichText,
  createEntityText,
  createRichTextField,
  createStyledRtfDefault,
  createStyledRtfField,
  createStyledTextDefault,
  createStyledTextField,
  createTextField,
  getScopedTypographyCss,
  normalizeResolvedRichText,
  resolvePlainText,
  resolveThemeColor,
  textStyleToCss,
  type ThemeColorInput,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  Background,
  EntityField,
  MaybeRTF,
  createItemSource,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  resolveComponentData,
  useDocument,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

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

const typographyScopeClass = "yextPersonalFinanceFaqsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

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

const resolveRtfValue = (
  value:
    YextEntityField<TranslatableRichText> | TranslatableRichText | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
) => {
  if (!value) {
    return undefined;
  }

  return resolveComponentData(value, locale, streamDocument);
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
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const items = faqItemSource.resolveItems(props.content.items, streamDocument);

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceFaqs${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          id="faqs"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={sectionStyle}
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
        </Background>
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
