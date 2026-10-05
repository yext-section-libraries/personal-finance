import "../shared/typography.css";

import type { SectionConfig } from "@yext/visual-editor";

import {
  createEntityRichText,
  createRichTextField,
  createStyledRtfDefault,
  createStyledRtfField,
  createStyledTextDefault,
  createStyledTextField,
  defaultTextStyle,
  resolvePlainText,
  resolveThemeColor,
  textStyleToCss,
  renderRichText,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveComponentData,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type ComprehensiveCTAValue,
  type StyledButtonValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextCTAField,
  type YextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

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

type StoryParagraph = {
  text: YextEntityField<TranslatableRichText>;
};

type StoryContent = {
  sectionHeading: StyledTextProps;
  paragraphs: StoryParagraph[];
  primaryCta: ComprehensiveCTAValue;
};

type PersonalFinanceStoryProps = {
  section: SectionTheme;
  content: StoryContent;
  paragraphStyles: {
    paragraphs: Omit<StyledRtfProps, "text">;
  };
};

const defaultButtonStyle: StyledButtonValue = {
  ...defaultTextStyle,
  borderRadius: "default",
  letterSpacing: "default",
};

const createDefaultCta = (label: string, link: string) => {
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
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      button: defaultButtonStyle,
    },
  } satisfies ComprehensiveCTAValue;
};

const StoryFields: YextFields<PersonalFinanceStoryProps> = {
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
      sectionHeading: createStyledTextField(
        msg("fields.sectionHeading", "Section Heading"),
      ),
      paragraphs: {
        type: "array",
        label: msg("fields.paragraphs", "Paragraphs"),
        defaultItemProps: {
          text: createEntityRichText("Paragraph text"),
        },
        arrayFields: {
          text: createRichTextField(msg("fields.text", "Text")),
        },
      },
      primaryCta: {
        label: msg("fields.primaryCta", "Primary CTA"),
        type: "comprehensiveCTA",
      },
    },
  },
  paragraphStyles: {
    label: msg("fields.paragraphStyles", "Paragraph Styles"),
    type: "object",
    objectFields: {
      paragraphs: createStyledRtfField(msg("fields.paragraphs", "Paragraphs")),
    },
  },
};

export const PersonalFinanceStoryComponent: PuckComponent<
  PersonalFinanceStoryProps
> = (props) => {
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale =
    typeof streamDocument?.locale === "string" ? streamDocument.locale : "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceStory${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          id="about"
          className="overflow-x-clip border-t border-current/10 py-pageSection-verticalPadding"
          style={sectionStyle}
        >
          <div className="mx-auto max-w-pageSection-contentWidth px-6 text-center">
            <div className="mx-auto max-w-[980px]">
              <EntityField
                displayName={msg("fields.sectionHeading", "Section Heading")}
                fieldId={props.content.sectionHeading.text.field}
                constantValueEnabled={
                  props.content.sectionHeading.text.constantValueEnabled
                }
              >
                <h2
                  className="mx-auto max-w-[780px] font-h2-fontFamily text-h2-fontSize font-h2-fontWeight"
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
                    "About [[name]] - [[geomodifier]] [[address.city]]",
                  )}
                </h2>
              </EntityField>
              <div className="mt-6 space-y-4">
                {props.content.paragraphs.map((paragraph, index) => {
                  const richTextStyleOverrides = {
                    ...props.paragraphStyles.paragraphs.styles,
                    color: resolveThemeColor(
                      props.paragraphStyles.paragraphs.fontColor,
                      sectionForeground,
                    ),
                  };
                  const resolvedParagraph = resolveComponentData(
                    paragraph.text,
                    locale,
                    streamDocument,
                  );

                  return (
                    <EntityField
                      key={index}
                      displayName={msg("fields.paragraphs", "Paragraphs")}
                      fieldId={paragraph.text.field}
                      constantValueEnabled={paragraph.text.constantValueEnabled}
                    >
                      {renderRichText(
                        resolvedParagraph,
                        richTextStyleOverrides,
                      )}
                    </EntityField>
                  );
                })}
              </div>
              <div className="mt-8">
                <EntityField
                  displayName={msg("fields.primaryCta", "Primary CTA")}
                  fieldId={props.content.primaryCta.data.cta.field}
                  constantValueEnabled={
                    props.content.primaryCta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={
                      props.content.primaryCta as Partial<ComprehensiveCTAValue>
                    }
                  />
                </EntityField>
              </div>
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceStory: YextComponentConfig<PersonalFinanceStoryProps> =
  {
    label: msg("components.aboutSection", "About Section"),
    fields: StoryFields,
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
          "About [[name]] - [[geomodifier]] [[address.city]]",
        ),
        paragraphs: [
          {
            text: createEntityRichText(
              "[[name]] - [[geomodifier]] [[address.city]] is located in the South Tryon district near [[geomodifier]] [[address.city]] and supports clients across Mecklenburg County and surrounding communities. The office provides in-person and virtual financial planning conversations for individuals, families, retirees, and business owners looking for guidance around long-term financial goals.",
            ),
          },
          {
            text: createEntityRichText(
              "Clients commonly visit this location for retirement planning, portfolio reviews, investment guidance, and broader financial planning conversations. Advisors at this branch support both ongoing wealth management relationships and one-time planning discussions depending on client needs.",
            ),
          },
          {
            text: createEntityRichText(
              "The office includes private consultation rooms, multilingual support, and online scheduling for added flexibility. Saturday hours are available for select appointment types.",
            ),
          },
        ],
        primaryCta: createDefaultCta("Book Appointment", "#"),
      },
      paragraphStyles: {
        paragraphs: createStyledRtfDefault("Paragraph text"),
      },
    },
    render: PersonalFinanceStoryComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceStory",
  displayName: "About Section",
  description: "About",
  pageSetTypes: ["ENTITY"],
};
