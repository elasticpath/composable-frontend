# PDF Viewer Example for Elastic Path

This example demonstrates how to implement PDF file viewing for product documentation in an Elastic Path storefront. It showcases three different viewing modes (new tab, iframe modal, and PDF.js) with secure URL validation to prevent SSRF attacks.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Felasticpath%2Fcomposable-frontend%2Ftree%2Fmain%2Fexamples%2Fpdf-viewer&env=NEXT_PUBLIC_EPCC_CLIENT_ID,NEXT_PUBLIC_EPCC_ENDPOINT_URL,NEXT_PUBLIC_SITE_NAME,NEXT_PUBLIC_PASSWORD_PROFILE_ID&envDescription=Api%20keys%20can%20be%20found%20in%20your%20keys%20section%20of%20commerce%20manager&envLink=https%3A%2F%2Felasticpath.dev%2Fdocs%2Fdeveloper-tools%2Fcomposable-starter%2Fdeploy%2Fstorefront-deploy&project-name=elastic-path-pdf-viewer&repository-name=elastic-path-pdf-viewer)

## PDF Viewing Modes

1. **Tab Mode** - Opens PDFs in new browser tab
2. **iFrame Mode** - Displays PDFs in modal using browser's PDF viewer
3. **PDF.js Mode** - Custom PDF viewer with pagination controls

## Security

The PDF proxy validates URLs against an allowlist to prevent SSRF attacks:

```typescript
// src/app/api/pdf-proxy/route.ts
const ALLOWED_DOMAINS = [
  'd1s4tacif4dym4.cloudfront.net',
  // Add your trusted domains here
];
```

## Usage

1. **Upload PDFs** to products in Elastic Path Commerce Manager
2. **PDFs appear** automatically in "Reference Material" section on product pages
3. **Configure display mode** in `SimpleProductContent.tsx`:

```typescript
<ProductFiles
  files={otherFiles}
  pdfDisplayStyle={PDFDisplayStyle.pdfJs} // or .tab, .iframe
/>
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Tech Stack

- **Next.js** - React framework
- **react-pdf** - PDF rendering library
- **Elastic Path Commerce** - Product and file management
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling