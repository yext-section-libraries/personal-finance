import type { SectionConfig } from "@yext/visual-editor";

import { PuckComponent } from "@puckeditor/core";
import { CircleSlash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  msg,
  Body,
  EntityField,
  PageSection,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  VisibilityWrapper,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  backgroundColors,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  resolveYextEntityField,
  useDocument,
  pt,
} from "@yext/visual-editor";
import { isRichTextEmpty, renderRichText } from "../shared/sectionHelpers";

type PersonalFinanceBannerProps = {
  data: {
    text: YextEntityField<TranslatableRichText>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  styles: {
    textAlignment: "left" | "center" | "right";
  };
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const PersonalFinanceBannerFields: YextFields<PersonalFinanceBannerProps> = {
  data: {
    label: msg("fields.bannerText", "Banner Text"),
    type: "object",
    objectFields: {
      text: {
        label: msg("fields.text", "Text"),
        type: "entityField",
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.textColor", "Text Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  styles: {
    label: msg("fields.styles", "Styles"),
    type: "object",
    objectFields: {
      textAlignment: {
        label: msg("fields.textAlignment", "Text Alignment"),
        type: "radio",
        options: [
          { label: msg("fields.options.left", "Left"), value: "left" },
          { label: msg("fields.options.center", "Center"), value: "center" },
          { label: msg("fields.options.right", "Right"), value: "right" },
        ],
      },
    },
  },
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
};

const PersonalFinanceBannerComponent: PuckComponent<
  PersonalFinanceBannerProps
> = ({ data, styles, section, puck }) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const sectionStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const isMappedField =
    !data.text.constantValueEnabled && Boolean(data.text.field);

  if (
    isMappedField &&
    isRichTextEmpty(
      resolveYextEntityField(streamDocument, data.text, i18n.language),
    )
  ) {
    if (!puck.isEditing) {
      return <></>;
    }

    return (
      <PageSection
        background={section.backgroundColor}
        className="flex items-center justify-center"
        outerStyle={sectionStyle}
        verticalPadding="sm"
      >
        <div className="relative flex h-20 w-full flex-row items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 px-4">
          <CircleSlash2 className="h-10 w-10 flex-shrink-0 text-gray-400" />
          <div className="flex flex-col items-start">
            <Body className="font-medium text-gray-500" variant="sm">
              {pt("sectionHiddenForPage", "Section hidden for this page")}
            </Body>
            <Body className="font-normal text-gray-500" variant="sm">
              {pt("mappedBannerFieldEmpty", "The mapped banner field is empty")}
            </Body>
          </div>
        </div>
      </PageSection>
    );
  }

  const richTextStyleOverrides = {
    ...data.styles,
    color: getThemeColorCssValue(data.fontColor) ?? sectionStyle?.color,
  };
  const resolvedText = resolveComponentData(
    data.text,
    i18n.language,
    streamDocument,
  );

  if (!resolvedText) {
    return <></>;
  }

  return (
    <PageSection
      background={section.backgroundColor}
      className={`flex items-center ${
        {
          left: "justify-start text-left",
          center: "justify-center text-center",
          right: "justify-end text-right",
        }[styles.textAlignment]
      }`}
      outerStyle={sectionStyle}
      verticalPadding="sm"
    >
      <EntityField
        constantValueEnabled={data.text.constantValueEnabled}
        displayName="Banner Text"
        fieldId={data.text.field}
      >
        {renderRichText(resolvedText, richTextStyleOverrides)}
      </EntityField>
    </PageSection>
  );
};

/**
 * Displays a full-width, editor-configurable rich-text banner.
 */
export const PersonalFinanceBanner: YextComponentConfig<PersonalFinanceBannerProps> =
  {
    label: "Banner",
    fields: PersonalFinanceBannerFields,
    defaultProps: {
      data: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Planning for something new? Meet with an advisor for a personalized financial conversation.",
            ),
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      styles: {
        textAlignment: "center",
      },
      section: {
        backgroundColor: backgroundColors.color1.value,
        visibleOnLivePage: true,
      },
    },
    render: (props) => (
      <VisibilityWrapper
        isEditing={props.puck.isEditing}
        liveVisibility={props.section.visibleOnLivePage}
      >
        <PersonalFinanceBannerComponent {...props} />
      </VisibilityWrapper>
    ),
  };

export const config: SectionConfig = {
  id: "PersonalFinanceBanner",
  displayName: "Banner",
  description: "Banner",
  pageSetTypes: ["ENTITY"],
};
