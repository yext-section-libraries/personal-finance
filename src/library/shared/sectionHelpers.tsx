import * as React from "react";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  msg,
  MaybeRTF,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  getThemeColorHexValue,
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
    text: createTextField(msg("fields.text", "Text")),
    styles: {
      label: msg("fields.textStyles", "Text Styles"),
      type: "styledText" as const,
    },
    fontColor: {
      label: msg("fields.fontColor", "Font Color"),
      type: "basicSelector" as const,
      options: "SITE_COLOR" as const,
    },
  },
});

export const createStyledRtfField = (label: string) => ({
  label,
  type: "object" as const,
  objectFields: {
    text: createRichTextField(msg("fields.text", "Text")),
    styles: {
      label: msg("fields.textStyles", "Text Styles"),
      type: "styledText" as const,
    },
    fontColor: {
      label: msg("fields.fontColor", "Font Color"),
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
): string => {
  if (
    typeof color === "string" &&
    (color.startsWith("#") ||
      color.startsWith("var(") ||
      color.startsWith("rgb(") ||
      color.startsWith("rgba(") ||
      color.startsWith("hsl(") ||
      color === "currentColor")
  ) {
    return color;
  }
  return getThemeColorCssValue(color) ?? fallback;
};

/** Use the actual surface color for default text, inheriting through transparent surfaces. */
export const resolveSurfaceTextColor = (
  backgroundColor: ThemeColorInput,
  streamDocument?: Record<string, unknown>,
  inheritedColor = "#000000",
): string => {
  const selectedColor =
    typeof backgroundColor === "string"
      ? backgroundColor
      : backgroundColor?.selectedColor;
  if (!selectedColor || selectedColor === "default") {
    return inheritedColor;
  }

  const translucentHex = selectedColor.match(/^\[#[0-9a-f]{6}([0-9a-f]{2})\]$/i);
  if (translucentHex && translucentHex[1].toLowerCase() !== "ff") {
    return inheritedColor;
  }

  const hex = getThemeColorHexValue(selectedColor, streamDocument);
  const match = hex?.match(/^#([0-9a-f]{6})$/i);
  if (match) {
    const channels = [0, 2, 4].map((offset) =>
      parseInt(match[1].slice(offset, offset + 2), 16) / 255,
    );
    const [red, green, blue] = channels.map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.179
      ? "#000000"
      : "#ffffff";
  }

  if (selectedColor.startsWith("[rgba(") || selectedColor === "transparent") {
    return inheritedColor;
  }

  return (
    getSurfaceColorStyle(backgroundColor, streamDocument)?.color ??
    inheritedColor
  );
};

export const getContrastingSurfaceStyle = (
  backgroundColor: ThemeColorInput,
  streamDocument?: Record<string, unknown>,
  inheritedColor = "#000000",
): React.CSSProperties & { color: string } => ({
  ...getSurfaceColorStyle(backgroundColor, streamDocument),
  color: resolveSurfaceTextColor(
    backgroundColor,
    streamDocument,
    inheritedColor,
  ),
});

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
  const { color: colorOverride, ...styleOverrides } =
    richTextStyleOverrides ?? {};
  const textStyle = textStyleToCss(styleOverrides);
  const color = getThemeColorCssValue(colorOverride);
  const bodyVariables = Object.fromEntries(
    Object.entries(textStyle)
      .filter(([, styleValue]) => styleValue !== undefined)
      .flatMap(([property, styleValue]) => [
        [`--personal-finance-body-${property}`, styleValue],
        [`--${property}-body-${property}`, styleValue],
      ]),
  ) as React.CSSProperties;
  const wrapperStyle = {
    ...textStyle,
    ...bodyVariables,
    ...(color ? { color } : {}),
  };

  if (React.isValidElement(value)) {
    if (value.type === MaybeRTF) {
      const element = value as React.ReactElement<MaybeRTFProps>;
      return React.cloneElement(element, {
        className:
          [element.props.className, className].filter(Boolean).join(" ") ||
          undefined,
        richTextStyleOverrides: {
          ...element.props.richTextStyleOverrides,
          ...richTextStyleOverrides,
        },
        style: { ...element.props.style, ...wrapperStyle },
      });
    }

    const element = value as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
      children?: React.ReactNode;
    }>;
    const child = element.props.children;
    const isMaybeRtfChild =
      React.isValidElement(child) && child.type === MaybeRTF;
    const isRtfWrapperChild =
      React.isValidElement<{ className?: string; style?: React.CSSProperties }>(
        child,
      ) && child.props.className?.includes("rtf-wrapper");

    return React.cloneElement(element, {
      className:
        [element.props.className, className].filter(Boolean).join(" ") ||
        undefined,
      style: { ...element.props.style, ...wrapperStyle },
      children: isMaybeRtfChild
        ? renderRichText(child, richTextStyleOverrides)
        : isRtfWrapperChild
          ? React.cloneElement(child, {
              style: { ...child.props.style, ...wrapperStyle },
            })
          : child,
    });
  }

  const normalizedValue =
    value && typeof value === "object" && "defaultValue" in value
      ? value.defaultValue
      : value;
  const data =
    typeof normalizedValue === "string" ||
    (typeof normalizedValue === "object" &&
      normalizedValue !== null &&
      "html" in normalizedValue)
      ? (normalizedValue as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      className={className}
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
      style={wrapperStyle}
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
