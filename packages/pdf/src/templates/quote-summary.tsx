import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import * as React from "react";

export type QuoteSummaryPdfProps = {
  requestTitle: string;
  importerCompany: string;
  forwarderCompany: string;
  quoteAmount: string;
  shippingMode: "air" | "sea";
  transitRange: string;
  inclusions: string;
  exclusions: string;
  validUntil: string;
};

export function QuoteSummaryDocument({
  requestTitle,
  importerCompany,
  forwarderCompany,
  quoteAmount,
  shippingMode,
  transitRange,
  inclusions,
  exclusions,
  validUntil,
}: QuoteSummaryPdfProps) {
  return (
    <Document title={`Quote summary - ${requestTitle}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>importing.ph</Text>
          <Text style={styles.title}>Quote Summary</Text>
          <Text style={styles.subtitle}>{requestTitle}</Text>
        </View>

        <View style={styles.grid}>
          <Field label="Importer" value={importerCompany} />
          <Field label="Forwarder" value={forwarderCompany} />
          <Field label="Quote amount" value={quoteAmount} />
          <Field label="Mode" value={shippingMode.toUpperCase()} />
          <Field label="Transit range" value={transitRange} />
          <Field label="Valid until" value={validUntil} />
        </View>

        <Section title="Inclusions" value={inclusions} />
        <Section title="Exclusions" value={exclusions} />

        <Text style={styles.footer}>
          This summary reflects marketplace quote details captured in importing.ph.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderQuoteSummaryPdf(props: QuoteSummaryPdfProps) {
  const output = await pdf(<QuoteSummaryDocument {...props} />).toBuffer();

  if (Buffer.isBuffer(output)) {
    return output;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of output as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Section({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 42,
    color: "#172033",
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#d9dee7",
  },
  brand: {
    color: "#1f6feb",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    color: "#667085",
    fontSize: 13,
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 22,
  },
  field: {
    width: "50%",
    marginBottom: 14,
    paddingRight: 12,
  },
  label: {
    color: "#667085",
    fontSize: 9,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
    fontWeight: 700,
  },
  section: {
    marginBottom: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d9dee7",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 11,
  },
  footer: {
    marginTop: 18,
    color: "#667085",
    fontSize: 9,
  },
});
