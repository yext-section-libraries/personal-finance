import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  getAnalyticsScopeHash,
  resolveBreadcrumbs,
  resolveComponentData,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  type EntityFieldSelectorField,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
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

const isDefaultColorSelection = (color?: ThemeColorInput) => {
  const selectedColor =
    typeof color === "string" ? color : color?.selectedColor;

  return !selectedColor || selectedColor === "default";
};

const parseHexColor = (value: string) => {
  const normalizedValue = value.trim();
  const hexMatch = normalizedValue.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

  if (!hexMatch) {
    return undefined;
  }

  const hexValue =
    hexMatch[1].length === 3
      ? [...hexMatch[1]].map((character) => `${character}${character}`).join("")
      : hexMatch[1];

  return [
    Number.parseInt(hexValue.slice(0, 2), 16),
    Number.parseInt(hexValue.slice(2, 4), 16),
    Number.parseInt(hexValue.slice(4, 6), 16),
  ] as const;
};

const resolveReadableContrastColor = (backgroundColor?: ThemeColorInput) => {
  const selectedColor =
    typeof backgroundColor === "string"
      ? backgroundColor
      : backgroundColor?.selectedColor;

  if (
    !selectedColor ||
    selectedColor === "default" ||
    selectedColor === "white"
  ) {
    return "#000000";
  }

  if (selectedColor === "black") {
    return "#ffffff";
  }

  if (selectedColor.startsWith("[") && selectedColor.endsWith("]")) {
    const parsedColor = parseHexColor(selectedColor.slice(1, -1));

    if (!parsedColor) {
      return "#000000";
    }

    const [red, green, blue] = parsedColor.map((channel) => channel / 255);
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  if (selectedColor.startsWith("#")) {
    const parsedColor = parseHexColor(selectedColor);

    if (!parsedColor) {
      return "#000000";
    }

    const [red, green, blue] = parsedColor.map((channel) => channel / 255);
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  if (selectedColor.endsWith("-light")) {
    return "#000000";
  }

  return "#ffffff";
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

const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceBreadcrumbsTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceBreadcrumbsTypographyScope p,
.yextPersonalFinanceBreadcrumbsTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceBreadcrumbsTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceBreadcrumbsTypographyScope a:hover {
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

  const resolved = resolveComponentData(
    value as never,
    locale,
    streamDocument,
    {
    output: "plainText",
    },
  );

  if (typeof resolved === "string") {
    return resolved;
  }

  if (resolved && typeof resolved === "object" && "defaultValue" in resolved) {
    const defaultValue = (resolved as Record<string, unknown>).defaultValue;
    return typeof defaultValue === "string" ? defaultValue : fallback;
  }

  return fallback;
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

const BreadcrumbFields: YextFields<PersonalFinanceBreadcrumbsProps> = {
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
      includeCurrentLocation: {
        label: "Include Current Location",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      rootLabel: createStyledTextField("Root Label"),
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
  const readableTextColor = resolveReadableContrastColor(
    props.section.backgroundColor,
  );
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
        <section
          className={`${typographyScopeClass} overflow-x-clip py-4`}
          style={{
            backgroundColor: resolveThemeColor(
              props.section.backgroundColor,
              "#ffffff",
            ),
          }}
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
                No breadcrumbs available (section will be hidden on live page).
                Create a directory to enable breadcrumbs.
              </p>
            )}
          </div>
        </section>
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
