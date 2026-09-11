import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  MaybeRTF,
  getDefaultRTF,
  getThemeColorCssValue,
  resolveComponentData,
  type EntityFieldSelectorField,
  type MaybeRTFProps,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";

export type ThemeColorInput = string | ThemeColor | undefined;

export type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColorInput;
};

export type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColorInput;
};

export const defaultTextStyle: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

export const createEntityText = (
  constantValue: string,
): YextEntityField<TranslatableString> => ({
  field: "",
  constantValue: {
    defaultValue: constantValue,
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

export const createEntityRichText = (
  constantValue: string,
): YextEntityField<TranslatableRichText> => ({
  field: "",
  constantValue: {
    defaultValue: getDefaultRTF(constantValue),
    hasLocalizedValue: "true",
  },
  constantValueEnabled: true,
});

export const createTextField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.string"],
  };

  return {
    type: "entityField" as const,
    label,
    filter,
  };
};

export const createRichTextField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.rich_text_v2"],
  };

  return {
    type: "entityField" as const,
    label,
    filter,
  };
};

export const createStyledTextField = (label: string) => ({
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
});

export const createStyledRtfField = (label: string) => ({
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
});

export const createStyledTextDefault = (
  value: string,
  fontColor?: ThemeColor,
): StyledTextProps => ({
  text: createEntityText(value),
  styles: defaultTextStyle,
  fontColor,
});

export const createStyledRtfDefault = (
  value: string,
  fontColor?: ThemeColor,
): StyledRtfProps => ({
  text: createEntityRichText(value),
  styles: defaultTextStyle,
  fontColor,
});

export const resolvePlainText = (
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

export const normalizeResolvedRichText = (
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

export const textStyleToCss = (
  styles?: Partial<StyledTextValue>,
): React.CSSProperties => ({
  fontFamily:
    !styles?.fontFamily || styles.fontFamily === "default"
      ? undefined
      : styles.fontFamily,
  fontSize:
    !styles?.fontSize || styles.fontSize === "default"
      ? undefined
      : styles.fontSize,
  fontWeight:
    !styles?.fontWeight || styles.fontWeight === "default"
      ? undefined
      : styles.fontWeight,
  fontStyle:
    !styles?.fontStyle || styles.fontStyle === "default"
      ? undefined
      : styles.fontStyle,
  textTransform:
    !styles?.textTransform || styles.textTransform === "default"
      ? undefined
      : styles.textTransform,
});

export const resolveThemeColor = (
  color?: ThemeColorInput,
  fallback = "#ffffff",
): string => getThemeColorCssValue(color) ?? fallback;

export const hasImageSource = (
  image: ImageType | ComplexImageType | TranslatableAssetImage | undefined,
): image is ImageType | ComplexImageType | TranslatableAssetImage => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url.trim().length > 0;
  }

  return Boolean(
    "image" in image &&
      image.image &&
      typeof image.image === "object" &&
      "url" in image.image &&
      typeof image.image.url === "string" &&
      image.image.url.trim(),
  );
};

export const isRichTextEmpty = (value: unknown): boolean => {
  if (!value) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof value === "object" && "html" in value) {
    const html = (value as { html?: unknown }).html;
    return typeof html !== "string" || html.trim() === "";
  }

  return false;
};

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
  className?: string,
): React.ReactNode => {
  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides && !className) {
      return value;
    }

    const element = value as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    const resolvedColor = getThemeColorCssValue(
      richTextStyleOverrides?.color,
    );
    const { color: _color, ...styleOverrides } =
      richTextStyleOverrides ?? {};

    return React.cloneElement(element, {
      className:
        [element.props.className, className].filter(Boolean).join(" ") ||
        undefined,
      style: {
        ...element.props.style,
        ...styleOverrides,
        ...(resolvedColor ? { color: resolvedColor } : {}),
      },
    });
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      className={className}
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};

/** Numeric options formerly exposed by the untyped ASPECT_RATIO preset. */
export const aspectRatioOptions = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:3", value: 1.33 },
  { label: "3:2", value: 1.5 },
  { label: "5:3", value: 1.67 },
  { label: "16:9", value: 1.78 },
  { label: "2:1", value: 2 },
  { label: "3:1", value: 3 },
  { label: "4:1", value: 4 },
  { label: "4:5", value: 0.8 },
  { label: "3:4", value: 0.75 },
  { label: "2:3", value: 0.67 },
];

export const getScopedTypographyCss = (scopeClass: string): string => `
.${scopeClass} p,
.${scopeClass} li {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
}
${[1, 2, 3, 4, 5, 6]
  .map(
    (level) => `.${scopeClass} h${level} {
  font-family: var(--fontFamily-h${level}-fontFamily);
  font-size: var(--fontSize-h${level}-fontSize);
  line-height: 1.2;
  font-weight: var(--fontWeight-h${level}-fontWeight);
  font-style: var(--fontStyle-h${level}-fontStyle);
  text-transform: var(--textTransform-h${level}-textTransform);
}`,
  )
  .join("\n")}
.${scopeClass} a {
  font-family: var(--fontFamily-link-fontFamily);
  font-size: var(--fontSize-link-fontSize);
  font-weight: var(--fontWeight-link-fontWeight);
  font-style: var(--fontStyle-link-fontStyle);
  line-height: 1.5;
  text-decoration: none;
  text-transform: var(--textTransform-link-textTransform);
  letter-spacing: var(--letterSpacing-link-letterSpacing);
}
.${scopeClass} a:hover {
  text-decoration: underline;
}
`;
