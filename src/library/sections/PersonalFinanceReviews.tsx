import type { SectionConfig } from "@yext/visual-editor";

import {
  createStyledTextDefault,
  createStyledTextField,
  getScopedTypographyCss,
  resolvePlainText,
  resolveThemeColor,
  textStyleToCss,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  Background,
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
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

const typographyScopeClass = "yextPersonalFinanceReviewsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

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
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForeground = sectionStyle?.color ?? "currentColor";
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  const headingColor = resolveThemeColor(
    props.content.sectionHeading.fontColor,
    sectionForegroundColor,
  );
  const bodyColor = sectionForegroundColor;
  const accentColor = sectionForegroundColor;
  const cardStyle = getSurfaceColorStyle(
    props.content.reviewCard.backgroundColor,
    streamDocument,
  );
  const cardForegroundColor = cardStyle?.color ?? sectionForegroundColor;
  const businessResponseStyle = getSurfaceColorStyle(
    props.content.businessResponse.backgroundColor,
    streamDocument,
  );
  const businessResponseForegroundColor =
    businessResponseStyle?.color ?? cardForegroundColor;
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
                  <Background
                    as="div"
                    background={props.content.reviewCard.backgroundColor}
                    key={`${review.authorName || "review"}-${index}`}
                    className="rounded-[16px] border border-black/5 p-6 shadow-[0_6px_22px_rgba(9,30,66,0.08)]"
                    style={cardStyle}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3
                        className="text-base font-semibold"
                        style={{
                          color: resolveThemeColor(
                            props.content.sectionHeading.fontColor,
                            cardForegroundColor,
                          ),
                        }}
                      >
                        {review.authorName || "Anonymous"}
                      </h3>
                      <div className="text-sm">
                        {renderStars(
                          Math.round(review.rating ?? 0),
                          cardForegroundColor,
                        )}
                      </div>
                    </div>
                    {review.reviewDate ? (
                      <p
                        className="mt-2 text-xs uppercase tracking-[0.16em]"
                        style={{ color: cardForegroundColor }}
                      >
                        {formatDate(review.reviewDate)}
                      </p>
                    ) : null}
                    {review.content ? (
                      <p
                        className="mt-4 text-sm leading-7"
                        style={{ color: cardForegroundColor }}
                      >
                        {review.content}
                      </p>
                    ) : null}
                    {review.comments?.[0]?.content ? (
                      <Background
                        as="div"
                        background={props.content.businessResponse.backgroundColor}
                        className="mt-5 rounded-[12px] border border-black/5 p-4"
                        style={businessResponseStyle}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.16em]"
                          style={{
                            color: resolveThemeColor(
                              props.content.sectionHeading.fontColor,
                              businessResponseForegroundColor,
                            ),
                          }}
                        >
                          Business Response
                        </p>
                        <p
                          className="mt-2 text-sm leading-7"
                          style={{ color: businessResponseForegroundColor }}
                        >
                          {review.comments[0].content}
                        </p>
                      </Background>
                    ) : null}
                  </Background>
                ))}
              </div>
            ) : null}
          </div>
        </Background>
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
