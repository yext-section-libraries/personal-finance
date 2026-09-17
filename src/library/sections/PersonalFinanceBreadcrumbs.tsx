import type { SectionConfig } from "@yext/visual-editor";

import {
  createEntityText,
  createStyledTextField,
  defaultTextStyle,
  getScopedTypographyCss,
  resolvePlainText,
  resolveThemeColor,
  textStyleToCss,
  type ThemeColorInput,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveBreadcrumbs,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextEntityField,
  pt,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";

const isDefaultColorSelection = (color?: ThemeColorInput) => {
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

type BreadcrumbContent = {
  includeCurrentLocation: boolean;
  rootLabel: StyledTextProps;
};

type BreadcrumbItem = {
  name?: string;
  slug?: string;
  index?: number;
};

type BreadcrumbStreamDocument = {
  locale?: string;
  name?: string;
  address?: {
    line1?: string;
  };
};

type PersonalFinanceBreadcrumbsProps = {
  section: SectionTheme;
  content: BreadcrumbContent;
};

const typographyScopeClass = "yextPersonalFinanceBreadcrumbsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const BreadcrumbFields: YextFields<PersonalFinanceBreadcrumbsProps> = {
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
      includeCurrentLocation: {
        label: msg("fields.includeCurrentLocation", "Include Current Location"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      rootLabel: createStyledTextField(msg("fields.rootLabel", "Root Label")),
    },
  },
};

export const PersonalFinanceBreadcrumbsComponent: PuckComponent<
  PersonalFinanceBreadcrumbsProps
> = (props) => {
  const streamDocument = useDocument<BreadcrumbStreamDocument>();
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const locale = streamDocument.locale ?? "en";
  const breadcrumbs = (resolveBreadcrumbs(streamDocument as never) ??
    []) as BreadcrumbItem[];
  const rootLabel = resolvePlainText(
    props.content.rootLabel.text,
    locale,
    streamDocument as Record<string, unknown> | undefined,
    "All Locations",
  );
  const currentPageLabel =
    streamDocument.address?.line1 || streamDocument.name || "";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const readableTextColor = sectionStyle?.color ?? "currentColor";
  const rootTextColor = isDefaultColorSelection(
    props.content.rootLabel.fontColor,
  )
    ? readableTextColor
    : resolveThemeColor(props.content.rootLabel.fontColor, readableTextColor);

  const renderedItems = breadcrumbs
    .map((item, index) => {
      const isRoot = index === 0;
      const isCurrentPage = index === breadcrumbs.length - 1;
      const href = item.slug
        ? relativePrefixToRoot
          ? `${relativePrefixToRoot}${item.slug}`
          : item.slug
        : "";

      return {
        href,
        isCurrentPage,
        isRoot,
        label: isCurrentPage ? currentPageLabel : item.name || "",
      };
    })
    .filter((item) =>
      item.isCurrentPage
        ? props.content.includeCurrentLocation || breadcrumbs.length <= 1
        : true,
    )
    .filter((item) => item.label);

  if (renderedItems.length > 0 && rootLabel) {
    renderedItems[0] = {
      ...renderedItems[0],
      label: rootLabel,
    };
  }

  if (!renderedItems.length && !props.puck.isEditing) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceBreadcrumbs${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className={`${typographyScopeClass} overflow-x-clip py-4`}
          style={sectionStyle}
        >
          <style>{typographyScopeCss}</style>
          <div className="mx-auto max-w-[1410px] px-6">
            {renderedItems.length ? (
              <ol className="flex flex-wrap items-center gap-y-2 text-[0.95rem]">
                {renderedItems.map((item, index) => (
                  <li
                    key={`${item.label}-${index}`}
                    className="flex items-center"
                  >
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="px-2 text-sm"
                        style={{ color: readableTextColor }}
                      >
                        /
                      </span>
                    ) : null}
                    {item.isCurrentPage ? (
                      <span style={{ color: readableTextColor }}>
                        {item.label}
                      </span>
                    ) : item.isRoot ? (
                      <EntityField
                        displayName="Root Label"
                        fieldId={props.content.rootLabel.text.field}
                        constantValueEnabled={
                          props.content.rootLabel.text.constantValueEnabled
                        }
                      >
                        <Link
                          cta={{ link: item.href, linkType: "URL" }}
                          eventName={`breadcrumb${index}`}
                        >
                          <span
                            style={{
                              ...textStyleToCss(props.content.rootLabel.styles),
                              color: rootTextColor,
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </EntityField>
                    ) : (
                      <Link
                        cta={{ link: item.href, linkType: "URL" }}
                        eventName={`breadcrumb${index}`}
                      >
                        <span style={{ color: readableTextColor }}>
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p
                className="text-sm"
                style={{
                  color: readableTextColor,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  padding: "18px 24px",
                }}
              >
                {pt(
                  "breadcrumbsUnavailableEditor",
                  "No breadcrumbs available (section will be hidden on live page). Create a directory to enable breadcrumbs.",
                )}
              </p>
            )}
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceBreadcrumbs: YextComponentConfig<PersonalFinanceBreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    fields: BreadcrumbFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        includeCurrentLocation: true,
        rootLabel: {
          text: createEntityText("All Locations"),
          styles: defaultTextStyle,
        },
      },
    },
    render: PersonalFinanceBreadcrumbsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
