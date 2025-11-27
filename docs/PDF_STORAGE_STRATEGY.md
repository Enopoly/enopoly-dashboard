# PDF Storage Strategy

## Recommended Approach: Generate On-Demand (MVP)

For the initial implementation, we'll **generate PDFs on-demand** without storing them.

### How It Works:

- When user requests PDF: `GET /api/invoices/:id/pdf`
- Server generates PDF instantly from database data
- PDF is streamed directly to user's browser
- No storage required

### Pros:

- ✅ No storage costs
- ✅ Always up-to-date (reflects latest invoice data)
- ✅ Simple implementation
- ✅ No disk space management
- ✅ Works immediately

### Cons:

- ⚠️ Slight generation delay (usually < 1 second)
- ⚠️ Requires database access for each request

---

## Implementation

### Backend Endpoint:

```typescript
GET /api/invoices/:id/pdf
// Generates PDF from invoice data in database
// Streams PDF directly to response
```

### Response:

- Content-Type: `application/pdf`
- File name: `invoice-{invoice_number}.pdf`
- Streamed directly, no file saved

---

## Alternative Options (For Future)

### Option 1: File System Storage

Store PDFs in a folder on the server.

**Structure:**

```
server/
  └── pdfs/
      └── invoices/
          ├── INV-2024-0001.pdf
          ├── INV-2024-0002.pdf
          └── ...
```

**Pros:**

- ✅ Faster response (no generation needed)
- ✅ Can be cached/CDN'd

**Cons:**

- ⚠️ Requires disk space
- ⚠️ Need cleanup/management
- ⚠️ Not ideal for serverless/hosting platforms

**When to use:** High traffic or need instant PDF access

---

### Option 2: Database Storage (BLOB)

Store PDF as binary data in database.

**Database Schema Addition:**

```sql
ALTER TABLE invoices ADD COLUMN pdf_data BLOB;
```

**Pros:**

- ✅ Everything in one place (database)
- ✅ Easy backup/restore

**Cons:**

- ⚠️ Database bloat (PDFs are large)
- ⚠️ Slower queries
- ⚠️ Not recommended for large files

**When to use:** Small scale, want simplicity

---

### Option 3: Cloud Storage (S3, Cloudinary, etc.)

Store PDFs in cloud storage service.

**Services:**

- AWS S3
- Cloudinary
- DigitalOcean Spaces
- Render.com persistent disk

**Pros:**

- ✅ Scalable
- ✅ Reliable
- ✅ Can use CDN
- ✅ Serverless-friendly

**Cons:**

- ⚠️ Additional service/cost
- ⚠️ More complex setup
- ⚠️ Need to manage uploads

**When to use:** Production, high scale, multiple servers

---

## Recommended Progression

### Phase 1 (MVP - Days 1-10): Generate On-Demand

- Generate PDFs on-the-fly
- No storage needed
- Simplest approach
- Perfect for MVP

### Phase 2 (If Needed): File System Storage

- Add storage folder
- Generate and save PDFs
- Faster subsequent requests
- Easy to implement

### Phase 3 (Production Scale): Cloud Storage

- Migrate to S3/cloud storage
- Better for scaling
- Multiple server support

---

## Code Structure (On-Demand Generation)

```
server/
  └── src/
      └── services/
          └── pdf.ts
              ├── generateInvoicePDF(invoice)  // Generates PDF from invoice data
              └── streamPDFToResponse(pdf, res) // Streams PDF to HTTP response
```

### Example Flow:

1. User clicks "Download PDF" on invoice
2. Frontend: `GET /api/invoices/123/pdf`
3. Backend: Fetch invoice data from database
4. Backend: Generate PDF using PDFKit
5. Backend: Stream PDF directly to response
6. Browser: Downloads PDF file

---

## Storage Decision Matrix

| Factor               | On-Demand  | File System | Cloud Storage |
| -------------------- | ---------- | ----------- | ------------- |
| **Setup Complexity** | ✅ Easy    | ✅ Easy     | ⚠️ Medium     |
| **Cost**             | ✅ Free    | ✅ Free     | ⚠️ Small cost |
| **Speed**            | ⚠️ Fast    | ✅ Fastest  | ✅ Fast       |
| **Scalability**      | ⚠️ Limited | ⚠️ Limited  | ✅ Excellent  |
| **MVP Fit**          | ✅ Perfect | ✅ Good     | ⚠️ Overkill   |

---

## Recommendation for This Project

**Start with: Generate On-Demand**

Why:

- Fastest to implement
- Zero storage costs
- Perfect for MVP/initial launch
- Can always upgrade later

**Upgrade to file storage if:**

- Generating PDFs becomes slow
- High traffic volume
- Client requests pre-generation

**Upgrade to cloud storage if:**

- Multiple servers/deployment
- Need CDN for global access
- Large scale production

---

**Conclusion: Generate PDFs on-demand for MVP. It's simple, fast, and cost-effective. Upgrade storage later if needed!**
