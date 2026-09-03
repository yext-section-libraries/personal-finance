import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  resolveComponentData,
  useDocument,
  type EntityFieldSelectorField,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

type ThemeColorInput = string | ThemeColor | undefined;

const resolveThemeColor = (
  color?: ThemeColorInput,
  fallback = "#ffffff",
) => {
  const selectedColor = typeof color === "string" ? color : color?.selectedColor;

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

type ReviewComment = {
  content?: string;
  commentDate?: string;
};

type ReviewItem = {
  authorName?: string;
  rating?: number;
  content?: string;
  reviewDate?: string;
  comments?: ReviewComment[];
};

type ReviewAggregate = {
  publisher?: string;
  topReviews?: ReviewItem[];
};

type ReviewStreamDocument = {
  ref_reviewsAgg?: ReviewAggregate[];
};

type ReviewsContent = {
  sectionHeading: StyledTextProps;
  summaryLabel: StyledTextProps;
  reviewCard: {
    backgroundColor: ThemeColor;
  };
  businessResponse: {
    backgroundColor: ThemeColor;
  };
};

type PersonalFinanceReviewsProps = {
  section: SectionTheme;
  content: ReviewsContent;
};

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceReviewsTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceReviewsTypographyScope p,
.yextPersonalFinanceReviewsTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceReviewsTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceReviewsTypographyScope a:hover {
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

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const textStyleToCss = (styles?: Partial<StyledTextValue>) => {
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

const resolvePlainText = (
  value: TranslatableString | YextEntityField<TranslatableString> | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
  fallback = "",
): string => {
  if (!value) {
    return fallback;
  }

  const resolved = resolveComponentData(value as never, locale, streamDocument, {
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

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const renderStars = (rating: number, color: string) => {
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} style={{ color, opacity: index < rating ? 1 : 0.28 }}>
      ★
    </span>
  ));
};

const ReviewsFields: YextFields<PersonalFinanceReviewsProps> = {
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
      summaryLabel: createStyledTextField("Summary Label"),
      reviewCard: {
        label: "Review Card",
        type: "object",
        objectFields: {
          backgroundColor: {
            label: "Background Color",
            type: "basicSelector",
            options: "BACKGROUND_COLOR",
          },
        },
      },
      businessResponse: {
        label: "Business Response",
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

export const PersonalFinanceReviewsComponent: PuckComponent<
  PersonalFinanceReviewsProps
> = (props) => {
  const streamDocument = useDocument<ReviewStreamDocument>();
  const locale =
    typeof (streamDocument as Record<string, unknown> | undefined)?.locale ===
    "string"
      ? ((streamDocument as Record<string, unknown>).locale as string)
      : "en";
  const sectionForeground = props.section.backgroundColor.contrastingColor;
  const sectionForegroundColor = resolveThemeColor(sectionForeground, "#1a1a1a");
  const headingColor = resolveThemeColor(
    props.content.sectionHeading.fontColor,
    sectionForegroundColor,
  );
  const bodyColor = sectionForegroundColor;
  const accentColor = sectionForegroundColor;
  const cardBackgroundColor = resolveThemeColor(
    props.content.reviewCard.backgroundColor,
    "#ffffff",
  );
  const businessResponseBackgroundColor = resolveThemeColor(
    props.content.businessResponse.backgroundColor,
    "rgba(0,0,0,0.03)",
  );
  const aggregate = getAggregateRating(streamDocument as never) as {
    averageRating?: number;
    reviewCount?: number;
  };
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (item) => item.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const streamData = streamDocument as Record<string, unknown> | undefined;
  const sectionHeading = resolvePlainText(
    props.content.sectionHeading.text,
    locale,
    streamData,
    "Client Reviews",
  );
  const summaryLabel = resolvePlainText(
    props.content.summaryLabel.text,
    locale,
    streamData,
    "Average rating",
  );

  if (!reviews.length && !props.puck.isEditing) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceReviews${getAnalyticsScopeHash(props.id)}`}
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
                    color: headingColor,
                    ...textStyleToCss(props.content.sectionHeading.styles),
                  }}
                >
                  {sectionHeading}
                </h2>
              </EntityField>
              {reviews.length ? (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 text-lg">
                    {renderStars(
                      Math.round(aggregate.averageRating ?? 0),
                      accentColor,
                    )}
                  </div>
                  <p className="text-sm" style={{ color: bodyColor }}>
                    <EntityField
                      displayName="Summary Label"
                      fieldId={props.content.summaryLabel.text.field}
                      constantValueEnabled={
                        props.content.summaryLabel.text.constantValueEnabled
                      }
                    >
                      <span
                        style={{
                          color: resolveThemeColor(
                            props.content.summaryLabel.fontColor,
                            sectionForeground,
                          ),
                          ...textStyleToCss(props.content.summaryLabel.styles),
                        }}
                      >
                        {summaryLabel}
                      </span>
                    </EntityField>{" "}
                    <span
                      className="font-semibold"
                      style={{ color: headingColor }}
                    >
                      {(aggregate.averageRating ?? 0).toFixed(1)}
                    </span>{" "}
                    from{" "}
                    <span
                      className="font-semibold"
                      style={{ color: headingColor }}
                    >
                      {aggregate.reviewCount ?? reviews.length}
                    </span>{" "}
                    reviews
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm" style={{ color: bodyColor }}>
                  No first-party reviews available for this location.
                </p>
              )}
            </div>
            {reviews.length ? (
              <div className="grid justify-center gap-5 lg:grid-cols-3">
                {reviews.map((review, index) => (
                  <article
                    key={`${review.authorName || "review"}-${index}`}
                    className="rounded-[16px] border border-black/5 p-6 shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                    style={{ backgroundColor: cardBackgroundColor }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className="text-base font-semibold"
                        style={{ color: headingColor }}
                      >
                        {review.authorName || "Anonymous"}
                      </h3>
                      <div className="text-sm">
                        {renderStars(
                          Math.round(review.rating ?? 0),
                          accentColor,
                        )}
                      </div>
                    </div>
                    {review.reviewDate ? (
                      <p
                        className="mt-2 text-xs uppercase tracking-[0.16em]"
                        style={{ color: bodyColor }}
                      >
                        {formatDate(review.reviewDate)}
                      </p>
                    ) : null}
                    {review.content ? (
                      <p
                        className="mt-4 text-sm leading-7"
                        style={{ color: bodyColor }}
                      >
                        {review.content}
                      </p>
                    ) : null}
                    {review.comments?.[0]?.content ? (
                      <div
                        className="mt-5 rounded-[12px] border border-black/5 p-4"
                        style={{ backgroundColor: businessResponseBackgroundColor }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.16em]"
                          style={{ color: headingColor }}
                        >
                          Business Response
                        </p>
                        <p
                          className="mt-2 text-sm leading-7"
                          style={{ color: bodyColor }}
                        >
                          {review.comments[0].content}
                        </p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceReviews: YextComponentConfig<PersonalFinanceReviewsProps> =
  {
    label: "Reviews",
    fields: ReviewsFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#f8f8f8]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Client Reviews"),
        summaryLabel: createStyledTextDefault("Average rating"),
        reviewCard: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
        },
        businessResponse: {
          backgroundColor: {
            selectedColor: "[rgba(0,0,0,0.03)]",
            contrastingColor: "palette-quaternary",
          },
        },
      },
    },
    render: PersonalFinanceReviewsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceReviews",
  displayName: "Reviews",
  description: "Reviews",
  pageSetTypes: ["ENTITY"],
};
