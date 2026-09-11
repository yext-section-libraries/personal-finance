import type { SectionConfig } from "@yext/visual-editor";

import {
  createStyledTextDefault,
  createStyledTextField,
  defaultTextStyle,
  getScopedTypographyCss,
  resolvePlainText,
  resolveThemeColor,
} from "../shared/sectionHelpers";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
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
  type EntityFieldSelectorField,
  type StyledButtonValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextCTAField,
  type YextEntityField,
} from "@yext/visual-editor";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import {
  Address,
  AnalyticsScopeProvider,
  HoursTable,
  Link,
  type AddressType,
  type HoursType,
} from "@yext/pages-components";

type SectionTheme = {
  backgroundColor: ThemeColor;
  visibleOnLivePage: boolean;
};

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type StyledTextListProps = {
  text: YextEntityField<TranslatableString[]>;
  styles: StyledTextValue;
  fontColor?: string | ThemeColor;
};

type AddressFieldProps = {
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type EmailFieldProps = {
  list: YextEntityField<string[]>;
};

type HoursTableStyles = {
  startOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center" | "items-end";
};

type HoursTableFieldProps = {
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursTableStyles;
};

type DetailsContent = {
  sectionHeading: StyledTextProps;
  infoCardTitle: StyledTextProps;
  addressLabel: StyledTextProps;
  address: AddressFieldProps;
  phones: PhoneFieldProps;
  emailsLabel: StyledTextProps;
  emails: EmailFieldProps;
  primaryAction: ComprehensiveCTAValue;
  secondaryAction: ComprehensiveCTAValue;
  hoursTitle: StyledTextProps;
  hoursData: HoursTableFieldProps;
  hoursFooterText: StyledTextProps;
  secondaryHoursData: HoursTableFieldProps;
  clientServicesTitle: StyledTextProps;
  languagesLabel: StyledTextProps;
  languagesValue: StyledTextListProps;
  accessibilityLabel: StyledTextProps;
  accessibilityValue: StyledTextListProps;
  servicesLabel: StyledTextProps;
  serviceItems: StyledTextListProps;
};

type DetailsStyles = {
  cardBackgroundColor?: ThemeColor;
};

type PersonalFinanceDetailsProps = {
  section: SectionTheme;
  content: DetailsContent;
  styles: DetailsStyles;
};

const typographyScopeClass = "yextPersonalFinanceDetailsTypographyScope";
const typographyScopeCss = getScopedTypographyCss(typographyScopeClass);

const defaultButtonStyle: StyledButtonValue = {
  ...defaultTextStyle,
  borderRadius: "default",
  letterSpacing: "default",
};

const createTextListFieldValue = (
  values: string[],
): YextEntityField<TranslatableString[]> => {
  return {
    field: "",
    constantValue: values,
    constantValueEnabled: true,
  };
};

const createStyledTextListField = (label: string) => {
  const filter: EntityFieldSelectorField["filter"] = {
    types: ["type.string"],
    includeListsOnly: true,
  };

  return {
    label,
    type: "object" as const,
    objectFields: {
      text: {
        type: "entityField" as const,
        label: "Text List",
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

const createStyledTextListDefault = (
  values: string[],
  fontColor?: ThemeColor,
): StyledTextListProps => {
  return {
    text: createTextListFieldValue(values),
    styles: defaultTextStyle,
    fontColor,
  };
};

const createDefaultCta = (
  label: string,
  link: string,
  variant: "primary" | "link",
  color: ThemeColor,
) => {
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
      variant,
      color,
      button: defaultButtonStyle,
    },
  } satisfies ComprehensiveCTAValue;
};

const isDefaultToken = (value?: string) => {
  return !value || value === "default";
};

const textStyleToCss = (
  styles?: Partial<StyledTextValue>,
  fontColor?: string | ThemeColor,
  fallbackColor?: string,
): React.CSSProperties => {
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
    color: resolveThemeColor(fontColor, fallbackColor),
  };
};

const renderTextListInline = (
  values: string[],
  separator = ", ",
): React.ReactNode => {
  return values.join(separator);
};

type ResolvedPhoneItem = {
  label: string;
  originalNumber: string;
  formattedNumber: string;
  telDigits: string;
  fieldId: string;
  constantValueEnabled: boolean | undefined;
};

const SectionFields: YextFields<PersonalFinanceDetailsProps> = {
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
      sectionHeading: createStyledTextField("Heading"),
      infoCardTitle: createStyledTextField("Primary Card Heading"),
      addressLabel: createStyledTextField("Address Label"),
      address: {
        label: "Address",
        type: "object",
        objectFields: {
          address: {
            type: "entityField",
            label: "Address",
            filter: {
              types: ["type.address"],
            },
          },
          showRegion: {
            label: "Show Region",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showCountry: {
            label: "Show Country",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      phones: {
        label: "Phones",
        type: "object",
        objectFields: {
          items: {
            label: "Items",
            type: "array",
            arrayFields: {
              number: {
                type: "entityField",
                label: "Number",
                filter: {
                  types: ["type.phone"],
                },
              },
              label: {
                label: "Label",
                type: "text",
              },
            },
            defaultItemProps: {
              number: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              } satisfies YextEntityField<string>,
              label: "",
            },
            getItemSummary: (item) =>
              item.label ||
              item.number?.constantValue ||
              item.number?.field ||
              "Phone",
          },
          phoneFormat: {
            label: "Phone Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      emailsLabel: createStyledTextField("Emails Label"),
      emails: {
        label: "Emails",
        type: "object",
        objectFields: {
          list: {
            type: "entityField",
            label: "Emails",
            filter: {
              types: ["type.string"],
              includeListsOnly: true,
              allowList: ["emails"],
            },
            disallowTranslation: true,
          },
        },
      },
      primaryAction: {
        label: "Primary Action",
        type: "comprehensiveCTA",
      },
      secondaryAction: {
        label: "Secondary Action",
        type: "comprehensiveCTA",
      },
      hoursTitle: createStyledTextField("Hours Heading"),
      hoursData: {
        label: "Hours",
        type: "object",
        objectFields: {
          hours: {
            type: "entityField",
            label: "Hours",
            filter: {
              types: ["type.hours"],
            },
            disableConstantValueToggle: true,
          },
          hoursStyles: {
            label: "Hours Styles",
            type: "object",
            objectFields: {
              startOfWeek: {
                label: "Start Of Week",
                type: "select",
                options: [
                  { label: "Monday", value: "monday" },
                  { label: "Tuesday", value: "tuesday" },
                  { label: "Wednesday", value: "wednesday" },
                  { label: "Thursday", value: "thursday" },
                  { label: "Friday", value: "friday" },
                  { label: "Saturday", value: "saturday" },
                  { label: "Sunday", value: "sunday" },
                  { label: "Today", value: "today" },
                ],
              },
              collapseDays: {
                label: "Collapse Days",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              showAdditionalHoursText: {
                label: "Show Additional Hours Text",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              alignment: {
                label: "Alignment",
                type: "select",
                options: [
                  { label: "Start", value: "items-start" },
                  { label: "Center", value: "items-center" },
                  { label: "End", value: "items-end" },
                ],
              },
            },
          },
        },
      },
      hoursFooterText: createStyledTextField("Secondary Hours Heading"),
      secondaryHoursData: {
        label: "Secondary Hours",
        type: "object",
        objectFields: {
          hours: {
            type: "entityField",
            label: "Hours",
            filter: {
              types: ["type.hours"],
            },
            disableConstantValueToggle: true,
          },
          hoursStyles: {
            label: "Hours Styles",
            type: "object",
            objectFields: {
              startOfWeek: {
                label: "Start Of Week",
                type: "select",
                options: [
                  { label: "Monday", value: "monday" },
                  { label: "Tuesday", value: "tuesday" },
                  { label: "Wednesday", value: "wednesday" },
                  { label: "Thursday", value: "thursday" },
                  { label: "Friday", value: "friday" },
                  { label: "Saturday", value: "saturday" },
                  { label: "Sunday", value: "sunday" },
                  { label: "Today", value: "today" },
                ],
              },
              collapseDays: {
                label: "Collapse Days",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              showAdditionalHoursText: {
                label: "Show Additional Hours Text",
                type: "radio",
                options: [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ],
              },
              alignment: {
                label: "Alignment",
                type: "select",
                options: [
                  { label: "Start", value: "items-start" },
                  { label: "Center", value: "items-center" },
                  { label: "End", value: "items-end" },
                ],
              },
            },
          },
        },
      },
      clientServicesTitle: createStyledTextField("Secondary Card Heading"),
      languagesLabel: createStyledTextField("Languages Label"),
      languagesValue: createStyledTextListField("Languages Value"),
      accessibilityLabel: createStyledTextField("Accessibility Label"),
      accessibilityValue: createStyledTextListField("Accessibility Value"),
      servicesLabel: createStyledTextField("Services Label"),
      serviceItems: createStyledTextListField("Service Items"),
    },
  },
  styles: {
    label: "Style",
    type: "object",
    objectFields: {
      cardBackgroundColor: {
        label: "Card Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
};

const HoursTableBlock = ({
  value,
  displayName,
  fallbackClassName,
  textColor,
}: {
  value: HoursTableFieldProps;
  displayName: string;
  fallbackClassName?: string;
  textColor?: string;
}) => {
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale =
    typeof streamDocument?.locale === "string" ? streamDocument.locale : "en";
  const resolvedHours = resolveComponentData(
    value.hours,
    locale,
    streamDocument,
  ) as HoursType | undefined;
  const additionalHoursText =
    typeof streamDocument?.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";

  if (!resolvedHours) {
    return null;
  }

  return (
    <EntityField
      displayName={displayName}
      fieldId={value.hours.field}
      constantValueEnabled={value.hours.constantValueEnabled}
    >
      <div
        className={`flex flex-col ${value.hoursStyles.alignment}`}
        style={textColor ? { color: textColor } : undefined}
      >
        <HoursTable
          hours={resolvedHours}
          comingSoon={Boolean(streamDocument?.comingSoon)}
          startOfWeek={value.hoursStyles.startOfWeek}
          collapseDays={value.hoursStyles.collapseDays}
          className={fallbackClassName}
        />
        {value.hoursStyles.showAdditionalHoursText && additionalHoursText ? (
          <span className="mt-3 text-sm leading-6">
            {additionalHoursText}
          </span>
        ) : null}
      </div>
    </EntityField>
  );
};

export const PersonalFinanceDetailsComponent: PuckComponent<
  PersonalFinanceDetailsProps
> = (props) => {
  const [showSecondaryHours, setShowSecondaryHours] = React.useState(false);
  const streamDocument = useDocument() as Record<string, unknown> | undefined;
  const locale =
    typeof streamDocument?.locale === "string" ? streamDocument.locale : "en";
  const sectionStyle = getSurfaceColorStyle(
    props.section.backgroundColor,
    streamDocument,
  );
  const sectionForegroundColor = sectionStyle?.color ?? "#1a1a1a";
  const cardStyle = getSurfaceColorStyle(
    props.styles.cardBackgroundColor,
    streamDocument,
  );
  const cardForeground = cardStyle?.color ?? sectionForegroundColor;
  const bodyForeground = cardForeground;
  const resolvedAddress = resolveComponentData(
    props.content.address.address,
    locale,
    streamDocument,
  ) as AddressType | undefined;
  const resolvedPhoneItems: ResolvedPhoneItem[] = (props.content.phones.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      const normalizedLabel = item.label?.trim() ?? "";

      if (!normalizedNumber) {
        return null;
      }

      return {
        label: normalizedLabel,
        originalNumber: normalizedNumber,
        formattedNumber: formatPhoneNumber(
          normalizedNumber,
          props.content.phones.phoneFormat,
        ),
        telDigits: normalizedNumber.replace(/\D/g, ""),
        fieldId: item.number.field,
        constantValueEnabled: item.number.constantValueEnabled,
      };
    })
    .filter((item): item is ResolvedPhoneItem => item !== null);
  const resolvedEmailValue = resolveComponentData(
    props.content.emails.list,
    locale,
    streamDocument,
  ) as string[] | string | undefined;
  const resolvedEmails = Array.isArray(resolvedEmailValue)
    ? resolvedEmailValue
    : typeof resolvedEmailValue === "string" &&
        resolvedEmailValue.trim().length > 0
      ? [resolvedEmailValue]
      : [];
  const resolvedLanguages =
    (resolveComponentData(
      props.content.languagesValue.text,
      locale,
      streamDocument,
    ) as string[] | undefined) ?? [];
  const resolvedAccessibility =
    (resolveComponentData(
      props.content.accessibilityValue.text,
      locale,
      streamDocument,
    ) as string[] | undefined) ?? [];
  const resolvedServiceItems =
    (resolveComponentData(
      props.content.serviceItems.text,
      locale,
      streamDocument,
    ) as string[] | undefined) ?? [];
  const secondaryHours = resolveComponentData(
    props.content.secondaryHoursData.hours,
    locale,
    streamDocument,
  ) as HoursType | undefined;
  const shouldShowSecondaryHours = Boolean(secondaryHours || props.puck.isEditing);

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`PersonalFinanceDetails${getAnalyticsScopeHash(props.id)}`}
      >
        <style>{typographyScopeCss}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          id="locations"
          className={`${typographyScopeClass} overflow-x-clip py-11`}
          style={sectionStyle}
        >
          <div className="mx-auto max-w-[1410px] px-6">
            <div className="mx-auto mb-8 max-w-[780px] text-center">
              <EntityField
                displayName="Heading"
                fieldId={props.content.sectionHeading.text.field}
                constantValueEnabled={
                  props.content.sectionHeading.text.constantValueEnabled
                }
              >
                <h2
                  className="text-[2.2rem] font-bold tracking-[-0.04em]"
                  style={textStyleToCss(
                    props.content.sectionHeading.styles,
                    props.content.sectionHeading.fontColor,
                    sectionForegroundColor,
                  )}
                >
                  {resolvePlainText(
                    props.content.sectionHeading.text,
                    locale,
                    streamDocument,
                    "Location Details",
                  )}
                </h2>
              </EntityField>
            </div>
            <div className="grid justify-center gap-5 lg:[grid-template-columns:repeat(3,minmax(280px,430px))]">
              <Background
                as="div"
                background={props.styles.cardBackgroundColor}
                className="min-w-0 w-full rounded-[14px] border border-black/5 p-6 shadow-sm"
                style={cardStyle}
              >
                <EntityField
                  displayName="Primary Card Heading"
                  fieldId={props.content.infoCardTitle.text.field}
                  constantValueEnabled={
                    props.content.infoCardTitle.text.constantValueEnabled
                  }
                >
                  <h3
                    className="mb-4 text-[1.02rem] font-semibold"
                    style={textStyleToCss(
                      props.content.infoCardTitle.styles,
                      props.content.infoCardTitle.fontColor,
                      cardForeground,
                    )}
                  >
                    {resolvePlainText(
                      props.content.infoCardTitle.text,
                      locale,
                      streamDocument,
                      "Location Information",
                    )}
                  </h3>
                </EntityField>
                <div className="space-y-3 text-sm leading-6" style={{ color: bodyForeground }}>
                  {resolvedAddress ? (
                    <div>
                      <EntityField
                        displayName="Address Label"
                        fieldId={props.content.addressLabel.text.field}
                        constantValueEnabled={
                          props.content.addressLabel.text.constantValueEnabled
                        }
                      >
                        <div
                          className="font-semibold"
                          style={textStyleToCss(
                            props.content.addressLabel.styles,
                            props.content.addressLabel.fontColor,
                            cardForeground,
                          )}
                        >
                          {resolvePlainText(
                            props.content.addressLabel.text,
                            locale,
                            streamDocument,
                            "Address",
                          )}
                        </div>
                      </EntityField>
                      <EntityField
                        displayName="Address"
                        fieldId={props.content.address.address.field}
                        constantValueEnabled={
                          props.content.address.address.constantValueEnabled
                        }
                      >
                        <Address
                          address={resolvedAddress}
                          showRegion={props.content.address.showRegion}
                          showCountry={props.content.address.showCountry}
                        />
                      </EntityField>
                    </div>
                  ) : null}
                  {resolvedPhoneItems.length ? (
                    <div>
                      <div className="space-y-3">
                        {resolvedPhoneItems.map((item) => {
                          const phoneNumber =
                            !props.content.phones.includeHyperlink ||
                            !item.telDigits ? (
                              <div>{item.formattedNumber}</div>
                            ) : (
                              <Link
                                cta={{
                                  link: item.telDigits,
                                  linkType: "PHONE",
                                }}
                                style={{ color: bodyForeground }}
                              >
                                {item.formattedNumber}
                              </Link>
                            );

                          return (
                            <EntityField
                              key={`${item.label}-${item.originalNumber}`}
                              displayName="Phone Number"
                              fieldId={item.fieldId}
                              constantValueEnabled={item.constantValueEnabled}
                            >
                              <div className="space-y-0.5">
                                {item.label ? (
                                  <div
                                    className="font-semibold"
                                    style={{ color: cardForeground }}
                                  >
                                    {item.label}
                                  </div>
                                ) : null}
                                {phoneNumber}
                              </div>
                            </EntityField>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {resolvedEmails.length ? (
                    <div>
                      <EntityField
                        displayName="Emails Label"
                        fieldId={props.content.emailsLabel.text.field}
                        constantValueEnabled={
                          props.content.emailsLabel.text.constantValueEnabled
                        }
                      >
                        <div
                          className="font-semibold"
                          style={textStyleToCss(
                            props.content.emailsLabel.styles,
                            props.content.emailsLabel.fontColor,
                            cardForeground,
                          )}
                        >
                          {resolvePlainText(
                            props.content.emailsLabel.text,
                            locale,
                            streamDocument,
                            "Email",
                          )}
                        </div>
                      </EntityField>
                      <EntityField
                        displayName="Emails"
                        fieldId={props.content.emails.list.field}
                        constantValueEnabled={
                          props.content.emails.list.constantValueEnabled
                        }
                      >
                        <div className="flex flex-col gap-1">
                          {resolvedEmails.map((emailValue) => (
                            <Link
                              key={emailValue}
                              cta={{
                                link: emailValue,
                                linkType: "EMAIL",
                              }}
                              style={{ color: bodyForeground }}
                            >
                              {emailValue.replace(/^mailto:/i, "")}
                            </Link>
                          ))}
                        </div>
                      </EntityField>
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <EntityField
                    displayName="Primary Action"
                    fieldId={props.content.primaryAction.data.cta.field}
                    constantValueEnabled={
                      props.content.primaryAction.data.cta.constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.content
                          .primaryAction as Partial<ComprehensiveCTAValue>
                      }
                      className="min-h-[38px] rounded-[10px] px-4 text-xs font-bold"
                    />
                  </EntityField>
                  <EntityField
                    displayName="Secondary Action"
                    fieldId={props.content.secondaryAction.data.cta.field}
                    constantValueEnabled={
                      props.content.secondaryAction.data.cta
                        .constantValueEnabled
                    }
                  >
                    <ComprehensiveCTA
                      value={
                        props.content
                          .secondaryAction as Partial<ComprehensiveCTAValue>
                      }
                      className="min-h-[38px] px-1 text-xs font-medium"
                    />
                  </EntityField>
                </div>
              </Background>

              <Background
                as="div"
                background={props.styles.cardBackgroundColor}
                className="min-w-0 w-full rounded-[14px] border border-black/5 p-6 shadow-sm"
                style={cardStyle}
              >
                <EntityField
                  displayName="Hours Heading"
                  fieldId={props.content.hoursTitle.text.field}
                  constantValueEnabled={props.content.hoursTitle.text.constantValueEnabled}
                >
                  <h3
                    className="mb-4 text-[1.02rem] font-semibold"
                    style={textStyleToCss(
                      props.content.hoursTitle.styles,
                      props.content.hoursTitle.fontColor,
                      cardForeground,
                    )}
                  >
                    {resolvePlainText(
                      props.content.hoursTitle.text,
                      locale,
                      streamDocument,
                      "Lobby Hours",
                    )}
                  </h3>
                </EntityField>
                <HoursTableBlock
                  value={props.content.hoursData}
                  displayName="Hours"
                  fallbackClassName="text-sm leading-6 [&_.HoursTable-row]:grid [&_.HoursTable-row]:gap-1.5 sm:[&_.HoursTable-row]:grid-cols-[1fr_auto] sm:[&_.HoursTable-row]:gap-3"
                  textColor={bodyForeground}
                />
                {!resolveComponentData(
                  props.content.hoursData.hours,
                  locale,
                  streamDocument,
                ) ? (
                  <div className="text-sm leading-6" style={{ color: bodyForeground }}>
                    Hours unavailable
                  </div>
                ) : null}
                {shouldShowSecondaryHours ? (
                  <div className="mt-5 border-t border-black/10 pt-4">
                    <button
                      className="flex w-full items-center justify-between text-left text-sm font-semibold"
                      onClick={() =>
                        setShowSecondaryHours((currentValue) => !currentValue)
                      }
                      style={{ color: cardForeground }}
                      type="button"
                    >
                      <EntityField
                        displayName="Secondary Hours Heading"
                        fieldId={props.content.hoursFooterText.text.field}
                        constantValueEnabled={
                          props.content.hoursFooterText.text.constantValueEnabled
                        }
                      >
                        <span
                          style={textStyleToCss(
                            props.content.hoursFooterText.styles,
                            props.content.hoursFooterText.fontColor,
                            cardForeground,
                          )}
                        >
                          {resolvePlainText(
                            props.content.hoursFooterText.text,
                            locale,
                            streamDocument,
                            "ATM Deposit Cut-Off Hours",
                          )}
                        </span>
                      </EntityField>
                      <span className="text-lg leading-none">
                        {showSecondaryHours ? "−" : "+"}
                      </span>
                    </button>
                    {showSecondaryHours ? (
                      <div className="mt-4">
                        {secondaryHours ? (
                          <HoursTableBlock
                            value={props.content.secondaryHoursData}
                            displayName="Secondary Hours"
                            fallbackClassName="text-sm leading-6 [&_.HoursTable-row]:grid [&_.HoursTable-row]:gap-1.5 sm:[&_.HoursTable-row]:grid-cols-[1fr_auto] sm:[&_.HoursTable-row]:gap-3"
                            textColor={bodyForeground}
                          />
                        ) : (
                          <div
                            className="text-sm leading-6"
                            style={{ color: bodyForeground }}
                          >
                            Hours unavailable
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Background>

              <Background
                as="div"
                background={props.styles.cardBackgroundColor}
                className="min-w-0 w-full rounded-[14px] border border-black/5 p-6 shadow-sm"
                style={cardStyle}
              >
                <EntityField
                  displayName="Secondary Card Heading"
                  fieldId={props.content.clientServicesTitle.text.field}
                  constantValueEnabled={
                    props.content.clientServicesTitle.text.constantValueEnabled
                  }
                >
                  <h3
                    className="mb-4 text-[1.02rem] font-semibold"
                    style={textStyleToCss(
                      props.content.clientServicesTitle.styles,
                      props.content.clientServicesTitle.fontColor,
                      cardForeground,
                    )}
                  >
                    {resolvePlainText(
                      props.content.clientServicesTitle.text,
                      locale,
                      streamDocument,
                      "Client Services",
                    )}
                  </h3>
                </EntityField>
                <div className="space-y-5 text-sm leading-6" style={{ color: bodyForeground }}>
                  <div>
                    <EntityField
                      displayName="Languages Label"
                      fieldId={props.content.languagesLabel.text.field}
                      constantValueEnabled={
                        props.content.languagesLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="font-semibold"
                        style={textStyleToCss(
                          props.content.languagesLabel.styles,
                          props.content.languagesLabel.fontColor,
                          cardForeground,
                        )}
                      >
                        {resolvePlainText(
                          props.content.languagesLabel.text,
                          locale,
                          streamDocument,
                          "Languages",
                        )}
                      </div>
                    </EntityField>
                    <EntityField
                      displayName="Languages Value"
                      fieldId={props.content.languagesValue.text.field}
                      constantValueEnabled={
                        props.content.languagesValue.text.constantValueEnabled
                      }
                    >
                      <div
                        style={textStyleToCss(
                          props.content.languagesValue.styles,
                          props.content.languagesValue.fontColor,
                          bodyForeground,
                        )}
                      >
                        {renderTextListInline(resolvedLanguages)}
                      </div>
                    </EntityField>
                  </div>
                  <div>
                    <EntityField
                      displayName="Accessibility Label"
                      fieldId={props.content.accessibilityLabel.text.field}
                      constantValueEnabled={
                        props.content.accessibilityLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="font-semibold"
                        style={textStyleToCss(
                          props.content.accessibilityLabel.styles,
                          props.content.accessibilityLabel.fontColor,
                          cardForeground,
                        )}
                      >
                        {resolvePlainText(
                          props.content.accessibilityLabel.text,
                          locale,
                          streamDocument,
                          "Accessibility",
                        )}
                      </div>
                    </EntityField>
                    <EntityField
                      displayName="Accessibility Value"
                      fieldId={props.content.accessibilityValue.text.field}
                      constantValueEnabled={
                        props.content.accessibilityValue.text.constantValueEnabled
                      }
                    >
                      <div
                        style={textStyleToCss(
                          props.content.accessibilityValue.styles,
                          props.content.accessibilityValue.fontColor,
                          bodyForeground,
                        )}
                      >
                        {renderTextListInline(resolvedAccessibility)}
                      </div>
                    </EntityField>
                  </div>
                  <div>
                    <EntityField
                      displayName="Services Label"
                      fieldId={props.content.servicesLabel.text.field}
                      constantValueEnabled={
                        props.content.servicesLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="font-semibold"
                        style={textStyleToCss(
                          props.content.servicesLabel.styles,
                          props.content.servicesLabel.fontColor,
                          cardForeground,
                        )}
                      >
                        {resolvePlainText(
                          props.content.servicesLabel.text,
                          locale,
                          streamDocument,
                          "Services",
                        )}
                      </div>
                    </EntityField>
                    <EntityField
                      displayName="Service Items"
                      fieldId={props.content.serviceItems.text.field}
                      constantValueEnabled={
                        props.content.serviceItems.text.constantValueEnabled
                      }
                    >
                      <ul
                        className="mt-1 list-disc space-y-1 pl-5"
                        style={textStyleToCss(
                          props.content.serviceItems.styles,
                          props.content.serviceItems.fontColor,
                          bodyForeground,
                        )}
                      >
                        {resolvedServiceItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </EntityField>
                  </div>
                </div>
              </Background>
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const PersonalFinanceDetails: YextComponentConfig<PersonalFinanceDetailsProps> =
  {
    label: "Location Details",
    fields: SectionFields,
    defaultProps: {
      section: {
        backgroundColor: {
          selectedColor: "[#ececef]",
          contrastingColor: "black",
        },
        visibleOnLivePage: true,
      },
      content: {
        sectionHeading: createStyledTextDefault("Location Details"),
        infoCardTitle: createStyledTextDefault("Location Information"),
        addressLabel: createStyledTextDefault("Address"),
        address: {
          address: {
            field: "address",
            constantValue: {
              line1: "",
              city: "",
              postalCode: "",
              countryCode: "",
              region: "",
            },
            constantValueEnabled: false,
          } satisfies YextEntityField<AddressType>,
          showRegion: true,
          showCountry: false,
        },
        phones: {
          items: [
            {
              number: {
                field: "mainPhone",
                constantValue: "",
                constantValueEnabled: false,
              } satisfies YextEntityField<string>,
              label: "",
            },
          ],
          phoneFormat: "domestic",
          includeHyperlink: true,
        },
        emailsLabel: createStyledTextDefault("Email"),
        emails: {
          list: {
            field: "emails",
            constantValue: [],
            constantValueEnabled: false,
          } satisfies YextEntityField<string[]>,
        },
        primaryAction: createDefaultCta("Visit Website", "#", "primary", {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        }),
        secondaryAction: createDefaultCta("Book Appointment", "#", "link", {
          selectedColor: "default",
          contrastingColor: "black",
        }),
        hoursTitle: createStyledTextDefault("Lobby Hours"),
        hoursData: {
          hours: {
            field: "hours",
            constantValue: {},
            constantValueEnabled: false,
          } as YextEntityField<HoursType>,
          hoursStyles: {
            startOfWeek: "monday",
            collapseDays: false,
            showAdditionalHoursText: false,
            alignment: "items-start",
          },
        },
        hoursFooterText: createStyledTextDefault("ATM Deposit Cut-Off Hours"),
        secondaryHoursData: {
          hours: {
            field: "driveThroughHours",
            constantValue: {},
            constantValueEnabled: false,
          } as YextEntityField<HoursType>,
          hoursStyles: {
            startOfWeek: "monday",
            collapseDays: false,
            showAdditionalHoursText: false,
            alignment: "items-start",
          },
        },
        clientServicesTitle: createStyledTextDefault("Client Services"),
        languagesLabel: createStyledTextDefault("Languages"),
        languagesValue: createStyledTextListDefault([
          "English",
          "Spanish",
          "Chinese",
          "French",
        ]),
        accessibilityLabel: createStyledTextDefault("Accessibility"),
        accessibilityValue: createStyledTextListDefault([
          "ADA compliant entrance",
          "Elevator access",
          "Private consultation rooms",
        ]),
        servicesLabel: createStyledTextDefault("Services"),
        serviceItems: createStyledTextListDefault([
          "Private consultations",
          "Accessible entrance",
          "Notary on-site",
          "Drive-thru ATM",
        ]),
      },
      styles: {
        cardBackgroundColor: {
          selectedColor: "[#f2f2f4]",
          contrastingColor: "black",
        },
      },
    },
    render: PersonalFinanceDetailsComponent,
  };

export const config: SectionConfig = {
  id: "PersonalFinanceDetails",
  displayName: "Location Details",
  description: "Location Details",
  pageSetTypes: ["ENTITY"],
};
