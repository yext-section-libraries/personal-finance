import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  getAnalyticsScopeHash,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  useDocument,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import {
  type EntityFieldSelectorField as EntityFieldSelectorFieldFromVisualEditor,
  type ComprehensiveCTAValue as ComprehensiveCTAValueFromVisualEditor,
  resolveComponentData as resolveComponentDataFromVisualEditor,
  resolveLocalizedAssetImage as resolveLocalizedAssetImageFromVisualEditor,
  type EnhancedTranslatableCTA as EnhancedTranslatableCTAFromVisualEditor,
  type StyledLinkValue as StyledLinkValueFromVisualEditor,
  type StyledTextValue as StyledTextValueFromVisualEditor,
  type ThemeColor as ThemeColorFromVisualEditor,
  type TranslatableAssetImage as TranslatableAssetImageFromVisualEditor,
  type TranslatableString as TranslatableStringFromVisualEditor,
  type YextCTAField as YextCTAFieldFromVisualEditor,
  type YextEntityField as YextEntityFieldFromVisualEditor,
} from "@yext/visual-editor";

type ThemeColorValue = ThemeColorFromVisualEditor;
type ThemeColorInput = string | ThemeColorValue | undefined;

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

const defaultReadableTextColor: ThemeColorValue = {
  selectedColor: "default",
  contrastingColor: "black",
};

const isDefaultColorSelection = (color?: ThemeColorInput): boolean => {
  const selectedColor =
    typeof color === "string" ? color : color?.selectedColor;
  return !selectedColor || selectedColor === "default";
};

const parseCssColor = (value: string): [number, number, number] | undefined => {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "white") {
    return [255, 255, 255];
  }

  if (normalizedValue === "black") {
    return [0, 0, 0];
  }

  const hexMatch = normalizedValue.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hexValue =
      hexMatch[1].length === 3
        ? [...hexMatch[1]]
            .map((character) => `${character}${character}`)
            .join("")
        : hexMatch[1];

    return [
      Number.parseInt(hexValue.slice(0, 2), 16),
      Number.parseInt(hexValue.slice(2, 4), 16),
      Number.parseInt(hexValue.slice(4, 6), 16),
    ];
  }

  const rgbMatch = normalizedValue.match(/^rgba?\(([^)]+)\)$/);
  if (!rgbMatch) {
    return undefined;
  }

  const channels = rgbMatch[1]
    .split(",")
    .slice(0, 3)
    .map((channel) => Number.parseFloat(channel.trim()));

  return channels.every((channel) => Number.isFinite(channel))
    ? [channels[0], channels[1], channels[2]]
    : undefined;
};

const resolveBrowserColor = (color: string): string => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return color;
  }

  const probe = document.createElement("span");
  probe.style.color = color;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolvedColor = window.getComputedStyle(probe).color;
  probe.remove();
  return resolvedColor || color;
};

/**
 * Resolves the black-or-white text color that contrasts with the section background.
 */
const resolveReadableTextColor = (
  backgroundColor: ThemeColorInput,
  fallbackBackgroundColor: string,
): string => {
  const parsedColor = parseCssColor(
    resolveBrowserColor(
      resolveThemeColor(backgroundColor, fallbackBackgroundColor),
    ),
  );

  if (!parsedColor) {
    return "#1a1a1a";
  }

  const [red, green, blue] = parsedColor.map((channel) => {
    const normalizedChannel = channel / 255;
    return normalizedChannel <= 0.03928
      ? normalizedChannel / 12.92
      : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
};

type EditableMappedText = {
  constantValue: TranslatableStringFromVisualEditor;
  mappedField?: YextEntityFieldFromVisualEditor<TranslatableStringFromVisualEditor>;
};
type EditableText =
  | EditableMappedText
  | TranslatableStringFromVisualEditor
  | YextEntityFieldFromVisualEditor<TranslatableStringFromVisualEditor>;
type EditableLink = {
  label: EditableText;
  href: EditableText;
  ariaLabel?: EditableText;
  openInNewTab?: boolean;
};
type EditableCta = EditableLink | YextCTAFieldFromVisualEditor;
type EditableImage = TranslatableAssetImageFromVisualEditor | undefined;
type StyledTextProps = {
  text: YextEntityFieldFromVisualEditor<TranslatableStringFromVisualEditor>;
  styles: StyledTextValueFromVisualEditor;
  fontColor?: string | ThemeColorValue;
};
type SectionTheme = {
  backgroundColor: ThemeColorValue;
  backgroundImage?: EditableImage;
  headingTextColor?: ThemeColorValue;
  bodyTextColor?: ThemeColorValue;
  accentTextColor?: ThemeColorValue;
  linkTextColor?: ThemeColorValue;
  buttonTextColor?: ThemeColorValue;
  visibleOnLivePage: boolean;
};

const defaultTextStyle: StyledTextValueFromVisualEditor = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const typographyScopeClass = "yextPersonalFinanceFooterTypographyScope";
const typographyScopeCss = `
.yextPersonalFinanceFooterTypographyScope p,
.yextPersonalFinanceFooterTypographyScope li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
.yextPersonalFinanceFooterTypographyScope h1 {
  font-family: var(--fontFamily-h1-fontFamily);
  font-size: var(--fontSize-h1-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h1-fontWeight);
  font-style: var(--fontStyle-h1-fontStyle);
  text-transform: var(--textTransform-h1-textTransform);
}
.yextPersonalFinanceFooterTypographyScope h2 {
  font-family: var(--fontFamily-h2-fontFamily);
  font-size: var(--fontSize-h2-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h2-fontWeight);
  font-style: var(--fontStyle-h2-fontStyle);
  text-transform: var(--textTransform-h2-textTransform);
}
.yextPersonalFinanceFooterTypographyScope h3 {
  font-family: var(--fontFamily-h3-fontFamily);
  font-size: var(--fontSize-h3-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h3-fontWeight);
  font-style: var(--fontStyle-h3-fontStyle);
  text-transform: var(--textTransform-h3-textTransform);
}
.yextPersonalFinanceFooterTypographyScope h4 {
  font-family: var(--fontFamily-h4-fontFamily);
  font-size: var(--fontSize-h4-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h4-fontWeight);
  font-style: var(--fontStyle-h4-fontStyle);
  text-transform: var(--textTransform-h4-textTransform);
}
.yextPersonalFinanceFooterTypographyScope h5 {
  font-family: var(--fontFamily-h5-fontFamily);
  font-size: var(--fontSize-h5-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h5-fontWeight);
  font-style: var(--fontStyle-h5-fontStyle);
  text-transform: var(--textTransform-h5-textTransform);
}
.yextPersonalFinanceFooterTypographyScope h6 {
  font-family: var(--fontFamily-h6-fontFamily);
  font-size: var(--fontSize-h6-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h6-fontWeight);
  font-style: var(--fontStyle-h6-fontStyle);
  text-transform: var(--textTransform-h6-textTransform);
}
.yextPersonalFinanceFooterTypographyScope a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.yextPersonalFinanceFooterTypographyScope a:hover {
  text-decoration: underline;
}
`;

const defaultLinkStyle: StyledLinkValueFromVisualEditor = {
  ...defaultTextStyle,
  includeCaret: "default",
  letterSpacing: "default",
};

const createEntityText = (
  constantValue: string,
): YextEntityFieldFromVisualEditor<TranslatableStringFromVisualEditor> => {
  return {
    field: "",
    constantValue: {
      defaultValue: constantValue,
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  };
};

const createStyledTextField = (label: string) => {
  const filter: EntityFieldSelectorFieldFromVisualEditor["filter"] = {
    types: ["type.string"],
  };

  return {
    label,
    type: "object" as const,
    objectFields: {
      text: {
        type: "entityField" as const,
        label: "Text",
        filter,
      },
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
  fontColor?: ThemeColorValue,
): StyledTextProps => {
  return {
    text: createEntityText(value),
    styles: defaultTextStyle,
    fontColor,
  };
};

const createNavigationCta = (
  label: string,
  link = "#",
): ComprehensiveCTAValueFromVisualEditor => {
  return {
    data: {
      actionType: "link",
      cta: {
        field: "",
        constantValue: {
          label,
          link,
          linkType: "URL",
        },
        constantValueEnabled: true,
        selectedType: "textAndLink",
      },
      openInNewTab: false,
    },
    styles: {
      variant: "primary",
      color: {
        ...defaultReadableTextColor,
      },
      button: {
        ...defaultTextStyle,
        borderRadius: "default",
        letterSpacing: "default",
      },
    },
  };
};

const createSectionThemeFields = () => {
  return {
    backgroundColor: {
      label: "Background Color",
      type: "basicSelector" as const,
      options: "BACKGROUND_COLOR" as const,
    },
    visibleOnLivePage: {
      label: "Visible on Live Page",
      type: "radio" as const,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  };
};

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const resolveSectionStyles = (
  section: SectionTheme,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
  fallbackColor = "#ffffff",
): CSSProperties => {
  const backgroundImage = resolveImageData(
    section.backgroundImage,
    locale,
    streamDocument,
  );

  return {
    backgroundColor: resolveThemeColor(section.backgroundColor, fallbackColor),
    backgroundImage: backgroundImage.src
      ? `url(${backgroundImage.src})`
      : undefined,
    backgroundPosition: backgroundImage.src ? "center" : undefined,
    backgroundRepeat: backgroundImage.src ? "no-repeat" : undefined,
    backgroundSize: backgroundImage.src ? "cover" : undefined,
  };
};

const resolveSectionTextColors = (
  section: SectionTheme,
  defaults: {
    headingTextColor: string;
    bodyTextColor: string;
    accentTextColor?: string;
    linkTextColor?: string;
    buttonTextColor?: string;
  },
) => {
  const headingTextColor = resolveThemeColor(
    section.headingTextColor,
    defaults.headingTextColor,
  );
  const bodyTextColor = resolveThemeColor(
    section.bodyTextColor,
    defaults.bodyTextColor,
  );
  const accentTextColor = resolveThemeColor(
    section.accentTextColor,
    defaults.accentTextColor ?? defaults.headingTextColor,
  );
  const linkTextColor = resolveThemeColor(
    section.linkTextColor,
    defaults.linkTextColor ?? accentTextColor,
  );
  const buttonTextColor = resolveThemeColor(
    section.buttonTextColor,
    defaults.buttonTextColor ?? linkTextColor,
  );

  return {
    headingTextColor,
    bodyTextColor,
    accentTextColor,
    linkTextColor,
    buttonTextColor,
  };
};

const resolveText = (
  value: EditableText | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
  fallback = "",
): string => {
  if (!value) {
    return fallback;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "constantValue" in value &&
    "mappedField" in value
  ) {
    const mappedField = (value as EditableMappedText).mappedField;

    if (mappedField?.field) {
      const mappedValue = resolveComponentDataFromVisualEditor(
        {
          ...mappedField,
          constantValueEnabled: false,
        } as any,
        locale,
        streamDocument as any,
        { output: "plainText" },
      );

      if (typeof mappedValue === "string" && mappedValue.trim().length > 0) {
        return mappedValue;
      }

      if (
        mappedValue &&
        typeof mappedValue === "object" &&
        "defaultValue" in mappedValue
      ) {
        const defaultValue = (mappedValue as Record<string, unknown>)
          .defaultValue;
        if (
          typeof defaultValue === "string" &&
          defaultValue.trim().length > 0
        ) {
          return defaultValue;
        }
      }
    }

    return resolveText(
      (value as EditableMappedText).constantValue,
      locale,
      streamDocument,
      fallback,
    );
  }

  const resolved = resolveComponentDataFromVisualEditor(
    value as any,
    locale,
    streamDocument as any,
    { output: "plainText" },
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

const resolveCta = (
  value: EditableCta | undefined,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "object" && value !== null && "href" in value) {
    return {
      ariaLabel: resolveText(
        (value as EditableLink).ariaLabel,
        locale,
        streamDocument,
      ),
      label: resolveText((value as EditableLink).label, locale, streamDocument),
      link: resolveText((value as EditableLink).href, locale, streamDocument),
      openInNewTab: Boolean((value as EditableLink).openInNewTab),
    };
  }

  const resolved = resolveComponentDataFromVisualEditor(
    value as any,
    locale,
    streamDocument as any,
  ) as unknown as EnhancedTranslatableCTAFromVisualEditor | undefined;

  if (!resolved) {
    return undefined;
  }

  const label = resolveText(
    resolved.label as EditableText | undefined,
    locale,
    streamDocument,
  );
  const link = resolveText(
    resolved.link as EditableText | undefined,
    locale,
    streamDocument,
  );

  return {
    ...resolved,
    label,
    link,
  };
};

const resolveImageData = (
  value: EditableImage,
  locale: string,
  streamDocument: Record<string, unknown> | undefined,
  fallbackUrl = "",
  fallbackAlt = "",
) => {
  const normalizeAssetUrl = (url?: string) => {
    if (!url) {
      return url;
    }

    if (!url.startsWith("file://")) {
      return url;
    }

    try {
      const fileUrl = new URL(url);
      const srcIndex = fileUrl.pathname.indexOf("/src/");
      if (srcIndex === -1) {
        return url;
      }

      return encodeURI(fileUrl.pathname.slice(srcIndex));
    } catch {
      return url;
    }
  };

  const resolved = resolveComponentDataFromVisualEditor(
    value as any,
    locale,
    streamDocument as any,
  ) as unknown as TranslatableAssetImageFromVisualEditor | undefined;
  const localizedImage = resolveLocalizedAssetImageFromVisualEditor(
    resolved ?? value,
    locale,
  );
  const alt = resolveText(
    localizedImage?.alternateText,
    locale,
    streamDocument,
    localizedImage?.assetImage?.altText || fallbackAlt,
  );

  return {
    alt,
    src: normalizeAssetUrl(
      localizedImage?.assetImage?.transformedImage?.url ||
        localizedImage?.assetImage?.originalImage?.url ||
        localizedImage?.assetImage?.sourceUrl ||
        localizedImage?.url ||
        fallbackUrl,
    ),
  };
};

const textStyleToCss = (
  styles?: Partial<StyledTextValueFromVisualEditor>,
): CSSProperties => {
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

const linkStyleToCss = (
  styles?: Partial<StyledLinkValueFromVisualEditor>,
): CSSProperties => {
  return {
    ...textStyleToCss(styles),
    letterSpacing: isDefaultToken(styles?.letterSpacing)
      ? undefined
      : styles?.letterSpacing,
  };
};

type FooterNavItem = {
  cta: ComprehensiveCTAValueFromVisualEditor;
};

type PersonalFinanceFooterProps = {
  section: SectionTheme;
  brandName: StyledTextProps;
  navigationLinks: FooterNavItem[];
  copyrightText: StyledTextProps;
};

const SectionFields: YextFields<PersonalFinanceFooterProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: createSectionThemeFields(),
  },
  brandName: createStyledTextField("Brand Text"),
  navigationLinks: {
    type: "array",
    label: "Links",
    defaultItemProps: {
      cta: createNavigationCta("Link", "#"),
    },
    arrayFields: {
      cta: {
        type: "comprehensiveCTA",
        label: "Link",
      },
    },
  },
  copyrightText: createStyledTextField("Copyright Text"),
};

export const PersonalFinanceFooterComponent: PuckComponent<
  PersonalFinanceFooterProps
> = (props) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale = i18n.language;
  const sectionStyles = resolveSectionStyles(
    props.section,
    locale,
    streamDocument,
    "#0d7e86",
  );
  const textColors = resolveSectionTextColors(props.section, {
    headingTextColor: "#ffffff",
    bodyTextColor: "#e5eef0",
    linkTextColor: "#f8fafc",
  });
  const readableSectionTextColorFallback = resolveReadableTextColor(
    props.section.backgroundColor,
    "#0d7e86",
  );
  const defaultSectionTextColor =
    props.section.backgroundColor.contrastingColor &&
    props.section.backgroundColor.contrastingColor !== "default"
      ? resolveThemeColor(
          props.section.backgroundColor.contrastingColor,
          readableSectionTextColorFallback,
        )
      : readableSectionTextColorFallback;
  const brandName = resolveText(
    props.brandName.text,
    locale,
    streamDocument,
    "[[name]]",
  );
  const copyrightText = resolveText(
    props.copyrightText.text,
    locale,
    streamDocument,
    "Copyright © 2026, [[name]]",
  );
  const brandTextColor = isDefaultColorSelection(props.brandName.fontColor)
    ? defaultSectionTextColor
    : resolveThemeColor(props.brandName.fontColor, textColors.headingTextColor);
  const copyrightTextColor = isDefaultColorSelection(
    props.copyrightText.fontColor,
  )
    ? defaultSectionTextColor
    : resolveThemeColor(
        props.copyrightText.fontColor,
        textColors.bodyTextColor,
      );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceFooter${getAnalyticsScopeHash(props.id)}`}
      >
        <footer
          id="contact"
          style={sectionStyles}
          className={`${typographyScopeClass} overflow-x-clip`}
        >
          <style>{typographyScopeCss}</style>
          <div className="mx-auto max-w-[1410px] px-6 py-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <EntityField
                displayName="Brand Text"
                fieldId={props.brandName.text.field}
                constantValueEnabled={props.brandName.text.constantValueEnabled}
              >
                <p
                  className="text-sm font-semibold"
                  style={{
                    ...textStyleToCss(props.brandName.styles),
                    color: brandTextColor,
                  }}
                >
                  {brandName}
                </p>
              </EntityField>
              <nav
                aria-label="Footer navigation"
                className="flex flex-wrap gap-x-6 gap-y-3"
              >
                {props.navigationLinks.map((item, index) => {
                  const navigationCta = item.cta as {
                    data?: {
                      cta?: EditableCta;
                      openInNewTab?: boolean;
                    };
                    styles?: {
                      color?: ThemeColorValue;
                    };
                  };
                  const resolvedCta = resolveCta(
                    navigationCta.data?.cta,
                    locale,
                    streamDocument,
                  );
                  const linkTextColor = isDefaultColorSelection(
                    navigationCta.styles?.color,
                  )
                    ? defaultSectionTextColor
                    : resolveThemeColor(
                        navigationCta.styles?.color,
                        textColors.linkTextColor,
                      );
                  const href = resolvedCta?.link || "#";
                  const label = resolvedCta?.label || `Link ${index + 1}`;
                  const ctaField = navigationCta.data?.cta;
                  const navigationLink = (
                    <a
                      key={`${href}-${index}`}
                      aria-label={label}
                      href={href}
                      rel={resolvedCta?.openInNewTab ? "noreferrer" : undefined}
                      style={{
                        color: linkTextColor,
                        ...linkStyleToCss(defaultLinkStyle),
                      }}
                      target={
                        navigationCta.data?.openInNewTab ? "_blank" : undefined
                      }
                    >
                      {label}
                    </a>
                  );

                  return ctaField &&
                    typeof ctaField === "object" &&
                    "field" in ctaField ? (
                    <EntityField
                      key={`${href}-${index}`}
                      displayName={`Footer Link ${index + 1}`}
                      fieldId={ctaField.field}
                      constantValueEnabled={ctaField.constantValueEnabled}
                    >
                      {navigationLink}
                    </EntityField>
                  ) : (
                    navigationLink
                  );
                })}
              </nav>
            </div>
            <EntityField
              displayName="Copyright Text"
              fieldId={props.copyrightText.text.field}
              constantValueEnabled={
                props.copyrightText.text.constantValueEnabled
              }
            >
              <div
                className="mt-5 border-t border-white/30 pt-5 text-center text-sm"
                style={{
                  ...textStyleToCss(props.copyrightText.styles),
                  color: copyrightTextColor,
                }}
              >
                {copyrightText}
              </div>
            </EntityField>
          </div>
        </footer>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceFooter: YextComponentConfig<PersonalFinanceFooterProps> =
  {
    label: "Footer",
    fields: SectionFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        backgroundImage: undefined,
        visibleOnLivePage: true,
      },
      brandName: createStyledTextDefault("[[name]]", defaultReadableTextColor),
      navigationLinks: [
        {
          cta: createNavigationCta("Locations", "#locations"),
        },
        {
          cta: createNavigationCta("Services", "#services"),
        },
        {
          cta: createNavigationCta("Advisors", "#advisors"),
        },
        {
          cta: createNavigationCta("Disclosures", "#disclosures"),
        },
        {
          cta: createNavigationCta("Contact", "#contact"),
        },
      ],
      copyrightText: createStyledTextDefault(
        "Copyright © 2026, [[name]]",
        defaultReadableTextColor,
      ),
    },
    render: PersonalFinanceFooterComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
