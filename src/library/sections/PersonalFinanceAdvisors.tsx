import type { SectionConfig } from "@yext/visual-editor";

import {
  createEntityText,
  createTextField,
  defaultTextStyle,
  getScopedTypographyCss,
  hasImageSource,
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
  createItemSource,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveLocalizedAssetImage,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type ComprehensiveCTAValue,
  type EntityFieldSelectorField,
  type StyledButtonValue,
  type StyledImageValue,
  type StyledTextValue,
  type StreamDocument,
  type ThemeColor,
  type TranslatableAssetImage,
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
  cardBackgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type CardImageValue = YextEntityField<
  ImageType | ComplexImageType | TranslatableAssetImage
>;

type CardImageStyles = {
  imageConstrain: "fixed" | "filled";
  styles?: StyledImageValue;
};

type AdvisorFactData = {
  label: YextEntityField<TranslatableString>;
  value: YextEntityField<TranslatableString>;
};

type AdvisorCard = {
  image: CardImageValue;
  name: YextEntityField<TranslatableString>;
  role: YextEntityField<TranslatableString>;
  credentials: AdvisorFactData;
  licenses: AdvisorFactData;
  specialties: AdvisorFactData;
  cta: unknown;
};

type TextStyles = Omit<StyledTextProps, "text">;

type AdvisorsStyles = {
  image: CardImageStyles;
  name: TextStyles;
  role: TextStyles;
  credentials: TextStyles;
  licenses: TextStyles;
  specialties: TextStyles;
  factValue: TextStyles;
};

type AdvisorsContent = {
  sectionHeading: StyledTextProps;
  advisors: typeof advisorSource.value;
};

type PersonalFinanceAdvisorsProps = {
  section: SectionTheme;
  content: AdvisorsContent;
  styles: AdvisorsStyles;
};

const typographyScopeClass = "yextPersonalFinanceAdvisorsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const defaultButtonStyle: StyledButtonValue = {
  ...defaultTextStyle,
  borderRadius: "default",
  letterSpacing: "default",
};

const defaultImageStyle: StyledImageValue = {
  borderRadius: "default",
};

const PORTRAIT_IMAGE_URLS = [
  "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
  "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
  "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
];

const createCapturedAssetUrl = (filename: string) => {
  const index =
    [...filename].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    PORTRAIT_IMAGE_URLS.length;
  return PORTRAIT_IMAGE_URLS[index];
};

const advisorImages = [
  createCapturedAssetUrl("advisor1.jpg"),
  createCapturedAssetUrl("advisor2.jpg"),
];

const createStyledTextField = (label: string) => {
  return {
    label,
    type: "object" as const,
    objectFields: {
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

const createStyledTextFieldWithData = (label: string) => {
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
    } satisfies YextFields<CardImageStyles>,
  };
};

const createStyledTextDefaultWithData = (
  value: string,
  fontColor?: ThemeColor,
): StyledTextProps => {
  return {
    text: createEntityText(value),
    styles: defaultTextStyle,
    fontColor,
  };
};

const createStyledTextDefault = (fontColor?: ThemeColor): TextStyles => {
  return {
    styles: defaultTextStyle,
    fontColor,
  };
};

const createDefaultImageField = (
  url: string,
  alternateText: string,
): CardImageValue => ({
  field: "",
  constantValue: {
    url,
    width: 1267,
    height: 1900,
    alternateText,
  },
  constantValueEnabled: true,
});

const createDefaultCta = (label: string, link = "#"): ComprehensiveCTAValue => {
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
      variant: "link" as const,
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      button: {
        ...defaultButtonStyle,
        fontSize: "14px",
        fontWeight: "500",
      },
    },
  };
};

const advisorSource = createItemSource<AdvisorCard>({
  label: "Advisors",
  mappingFields: {
    image: createImageField("Image"),
    name: createTextField("Name"),
    role: createTextField("Role"),
    credentials: {
      label: "Credentials",
      type: "object" as const,
      objectFields: {
        label: createTextField("Label"),
        value: createTextField("Value"),
      },
    },
    licenses: {
      label: "Licenses",
      type: "object" as const,
      objectFields: {
        label: createTextField("Label"),
        value: createTextField("Value"),
      },
    },
    specialties: {
      label: "Specialties",
      type: "object" as const,
      objectFields: {
        label: createTextField("Label"),
        value: createTextField("Value"),
      },
    },
    cta: {
      label: "CTA",
      type: "comprehensiveCTA" as const,
    },
  },
  defaultValues: [
    {
      image: createDefaultImageField(advisorImages[0], "Advisor portrait"),
      name: createEntityText("Morgan Lee"),
      role: createEntityText("Senior Wealth Advisor"),
      credentials: {
        label: createEntityText("Credentials"),
        value: createEntityText("CFP"),
      },
      licenses: {
        label: createEntityText("Licenses"),
        value: createEntityText("Series 7, Series 66"),
      },
      specialties: {
        label: createEntityText("Specialties"),
        value: createEntityText(
          "Supports retirement planning and portfolio review conversations.",
        ),
      },
      cta: createDefaultCta("Advisor Page", "#"),
    },
    {
      image: createDefaultImageField(advisorImages[1], "Advisor portrait"),
      name: createEntityText("Avery Chen"),
      role: createEntityText("Financial Planner"),
      credentials: {
        label: createEntityText("Credentials"),
        value: createEntityText("ChFC"),
      },
      licenses: {
        label: createEntityText("Licenses"),
        value: createEntityText("Series 65"),
      },
      specialties: {
        label: createEntityText("Specialties"),
        value: createEntityText(
          "Supports financial planning and goal-based discussions.",
        ),
      },
      cta: createDefaultCta("Advisor Page", "#"),
    },
  ],
});

const AdvisorsFields: YextFields<PersonalFinanceAdvisorsProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      cardBackgroundColor: {
        label: "Card Background Color",
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
      sectionHeading: createStyledTextFieldWithData("Section Heading"),
      advisors: advisorSource.field,
    },
  },
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      image: createImageStyleField("Image"),
      name: createStyledTextField("Name"),
      role: createStyledTextField("Role"),
      credentials: createStyledTextField("Credentials Subheading"),
      licenses: createStyledTextField("Licenses Subheading"),
      specialties: createStyledTextField("Specialties Subheading"),
      factValue: createStyledTextField("Fact Value"),
    },
  },
};

export const PersonalFinanceAdvisorsComponent: PuckComponent<
  PersonalFinanceAdvisorsProps
> = (props) => {
  const streamDocument = useDocument<StreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const advisors = advisorSource.resolveItems(
    props.content.advisors,
    streamDocument,
  );
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  const cardStyle = getSurfaceColorStyle(
    props.section.cardBackgroundColor,
    streamDocument,
  );
  const cardForegroundColor = cardStyle?.color ?? sectionForegroundColor;

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceAdvisors${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          id="advisors"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={sectionStyle}
        >
          <style>{typographyScopeCss}</style>
          <div className="mx-auto max-w-[1410px] px-6">
            <div className="mx-auto mb-8 max-w-[780px] text-center">
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
                    "Meet the Team",
                  )}
                </h2>
              </EntityField>
            </div>
            <EntityField
              displayName="Advisors"
              fieldId={props.content.advisors.field}
              constantValueEnabled={props.content.advisors.constantValueEnabled}
            >
              <div className="grid justify-center gap-5 lg:[grid-template-columns:repeat(2,minmax(320px,560px))]">
                {advisors.map((advisor, index) => {
                  const advisorCta = advisor.cta as
                    Partial<ComprehensiveCTAValue> | undefined;
                  const advisorCtaSource = (
                    props.content.advisors.constantValueEnabled
                      ? props.content.advisors.constantValue[index]?.cta
                      : props.content.advisors.mappings?.cta
                  ) as ComprehensiveCTAValue | undefined;
                  const advisorCtaField = advisorCtaSource?.data.cta;
                  const name = resolvePlainText(
                    advisor.name,
                    locale,
                    streamDocument,
                    "Advisor name",
                  );
                  const image = resolveLocalizedAssetImage(
                    advisor.image as
                      ImageType | TranslatableAssetImage | undefined,
                    locale,
                  );
                  const imageWrapperStyle: React.CSSProperties = {
                    aspectRatio: 1,
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
                    width: "100%",
                    height: "100%",
                    objectFit:
                      props.styles.image.imageConstrain === "filled"
                        ? "cover"
                        : "contain",
                  };
                  const advisorFacts = [
                    {
                      fact: advisor.credentials,
                      styles: props.styles.credentials,
                    },
                    {
                      fact: advisor.licenses,
                      styles: props.styles.licenses,
                    },
                    {
                      fact: advisor.specialties,
                      styles: props.styles.specialties,
                    },
                  ];

                  return (
                    <Background
                      as="div"
                      background={props.section.cardBackgroundColor}
                      key={`${name}-${index}`}
                      className="min-w-0 w-full rounded-[14px] border border-black/5 p-6"
                      style={cardStyle}
                    >
                      <div className="mb-[18px] flex min-w-0 items-center gap-4">
                        {hasImageSource(image) ? (
                          <div
                            className="h-[92px] w-[92px] rounded-full"
                            style={imageWrapperStyle}
                          >
                            <Image
                              image={image}
                              className="h-full w-full"
                              style={imageStyle}
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0">
                          <h3
                            className="text-[1.15rem] font-semibold"
                            style={{
                              color: resolveThemeColor(
                                props.styles.name.fontColor,
                                cardForegroundColor,
                              ),
                              ...textStyleToCss(props.styles.name.styles),
                            }}
                          >
                            {name}
                          </h3>
                          <p
                            className="mt-1 text-[1rem]"
                            style={{
                              color: resolveThemeColor(
                                props.styles.role.fontColor,
                                cardForegroundColor,
                              ),
                              ...textStyleToCss(props.styles.role.styles),
                            }}
                          >
                            {resolvePlainText(
                              advisor.role,
                              locale,
                              streamDocument,
                              "Advisor role",
                            )}
                          </p>
                        </div>
                      </div>
                      <dl className="space-y-3 border-t border-black/10 pt-[18px] text-sm leading-6">
                        {advisorFacts.map(({ fact, styles }, factIndex) => (
                          <div key={factIndex}>
                            <dt
                              className="font-semibold"
                              style={{
                                color: resolveThemeColor(
                                  styles.fontColor,
                                  cardForegroundColor,
                                ),
                                ...textStyleToCss(styles.styles),
                              }}
                            >
                              {resolvePlainText(
                                fact.label,
                                locale,
                                streamDocument,
                                "Label",
                              )}
                            </dt>
                            <dd
                              style={{
                                color: resolveThemeColor(
                                  props.styles.factValue.fontColor,
                                  cardForegroundColor,
                                ),
                                ...textStyleToCss(
                                  props.styles.factValue.styles,
                                ),
                              }}
                            >
                              {resolvePlainText(
                                fact.value,
                                locale,
                                streamDocument,
                                "Value",
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {advisorCta ? (
                        <div className="mt-4">
                          {(() => {
                            const ctaVariant = advisorCta.styles?.variant;

                            return (
                              <EntityField
                                displayName={`Advisor ${index + 1} CTA`}
                                fieldId={advisorCtaField?.field}
                                constantValueEnabled={
                                  advisorCtaField?.constantValueEnabled
                                }
                              >
                                <ComprehensiveCTA
                                  value={advisorCta}
                                  className={
                                    ctaVariant === "link"
                                      ? "min-h-0 justify-start border-0 bg-transparent px-0 py-0 text-sm font-medium shadow-none"
                                      : "inline-flex min-h-[44px] items-center justify-center rounded-[10px] px-5 py-2.5 text-sm font-medium"
                                  }
                                />
                              </EntityField>
                            );
                          })()}
                        </div>
                      ) : null}
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

export const PersonalFinanceAdvisors: YextComponentConfig<PersonalFinanceAdvisorsProps> =
  {
    label: "Team",
    fields: AdvisorsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        cardBackgroundColor: {
          selectedColor: "[#f2f2f4]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefaultWithData("Meet the Team"),
        advisors: advisorSource.defaultValue,
      },
      styles: {
        image: {
          imageConstrain: "filled",
          styles: defaultImageStyle,
        },
        name: createStyledTextDefault(),
        role: createStyledTextDefault(),
        credentials: createStyledTextDefault(),
        licenses: createStyledTextDefault(),
        specialties: createStyledTextDefault(),
        factValue: createStyledTextDefault(),
      },
    },
    render: PersonalFinanceAdvisorsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceAdvisors",
  displayName: "Team",
  description: "Team",
  pageSetTypes: ["ENTITY"],
};
