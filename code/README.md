# 🤖 Court Notification Automation System - Demo Mode

**AI-powered legal document processing system** demonstrating LLM integration, structured data extraction, and intelligent deadline calculation for Brazilian court notifications.

> **⚠️ Portfolio Version**: This repository demonstrates a simplified, safe-to-share version of the real production system — without proprietary logic, sensitive rules, or private data.

> **Note:** The production system processes 3,000+ real notifications monthly for 14+ lawyers with 99.22% success rate. See [main documentation](../README.md) for architecture and production metrics.

---

## 🎯 What This Demo Shows

This codebase demonstrates professional AI Engineering practices:

✅ **LLM Integration** - GPT-3.5-turbo for legal text extraction  
✅ **Structured Validation** - JSON schema validation with error handling  
✅ **Business Logic** - Complex deadline calculation (business days + holidays)  
✅ **Metrics Tracking** - Latency, cost, and success rate monitoring  
✅ **Clean Architecture** - Separation of concerns, typed interfaces  
✅ **Offline Demo** - Runs entirely on mock data without external APIs

---

## 🚀 Quick Start (3 steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
API_KEY=your_openai_api_key_here
```

**Required:**
- `API_KEY` - Your OpenAI API key ([get one here](https://platform.openai.com/api-keys))

**Optional (defaults are fine for demo):**
- `MOCK_MODE=true` - Use offline fixtures (recommended for demo)

### 3. Run the System

```bash
npm start
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🤖 AI Legal Notification System - Demo Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[FETCH] ✓ Loaded 3 notifications
[LLM] ✓ Response time: 1208ms | Cost: $0.000507
[SUCCESS] ✓ JSON structure validated ✓
[SUCCESS] ✓ Notification processed

📊 Execution Summary
[METRICS] Total Notifications: 9
[METRICS] Avg Latency: 1411ms
[METRICS] Total Cost: $0.004465
[METRICS] JSON Validation Rate: 100.0%
```

Results are saved to `output/processed_notifications.json`

---

## 📊 Demo Mode Details

### What is Mock Mode?

Mock Mode allows the system to run **completely offline** using sample data:

- **No database required** - Results saved to JSON files
- **No external APIs** - Sample notifications loaded from fixtures
- **Real LLM calls** - Actual GPT-3.5-turbo analysis (requires API key)
- **Anonymized data** - All lawyer and case information is fictional

### Sample Data

The system processes **3 court notifications** for **3 sample lawyers** from the file:
```
src/mocks/responses/notification_djen_response.json
```

These are real notification formats from Brazilian courts (TRT3, TJMG) with:
- Actual legal document structure
- Real deadline calculation scenarios
- Court-specific terminology preserved

---

## 📁 Project Structure

```
src/
├── index.ts                              # Entry point
├── config/
│   ├── environment.ts                    # Environment configuration
│   ├── holidays.ts                       # Court holidays (TRT3, TJMG, TRF6)
│   └── prompts/
│       └── intimacao-prompt.ts           # LLM prompt (simplified for demo)
├── services/
│   ├── orchestrators/
│   │   └── IntimationOrchestratorService.ts  # Main processing pipeline
│   └── analysis/
│       └── TextAnalysisService.ts        # LLM text extraction
├── utils/
│   ├── dateUtils.ts                      # Business day calculations
│   ├── jsonUtils.ts                      # JSON parsing & validation
│   ├── logger.ts                         # Professional logging system
│   └── errors.ts                         # Custom error handling
├── types/
│   └── interfaces.ts                     # TypeScript type definitions
└── mocks/
    └── responses/
        └── notification_djen_response.json  # Sample notification data
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the notification processing system |
| `npm run dev` | Run with auto-reload (nodemon) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run clean` | Remove build artifacts |

---

## 🧠 LLM Integration

### Analysis Pipeline

1. **Fetch** - Load notification text from API (or fixtures)
2. **Prompt** - Inject text into structured prompt template
3. **Extract** - Call GPT-3.5-turbo for structured extraction
4. **Validate** - Verify JSON schema and required fields
5. **Calculate** - Apply deadline rules based on court + case type

### Metrics Tracked

For each LLM call:
- **Latency** - Response time in milliseconds
- **Cost** - Estimated cost based on tokens (`$0.0005/1K input`, `$0.0015/1K output`)
- **Tokens** - Input, output, and total token usage
- **Validation** - JSON structure validation success/failure

### Prompt Strategy

The production prompt (proprietary) extracts 16+ fields. This demo uses a simplified 4-field extraction:
- `tipo_ato` - Type of legal act
- `prazo` - Deadline in days (if explicit)
- `resumo` - Brief summary
- `reu` - Defendant name

See `src/config/prompts/intimacao-prompt.ts` for implementation.

---

## ⚖️ Legal Deadline Calculation

The system implements Brazilian legal deadline rules:

### Algorithm Features

- **Business Days Only** - Skips weekends (Saturday/Sunday)
- **Court Holidays** - Excludes court-specific holidays and recess periods
- **Hierarchical Rules** - Applies court + case type specific deadlines
- **Timezone Aware** - Brazilian timezone (America/Sao_Paulo / GMT-3)

### Decision Hierarchy

1. **Explicit deadline** in notification text (highest priority)
2. **Scheduled date** (hearing, expert exam, trial)
3. **Court-specific rules** (e.g., TRT3 labor law: X days)
4. **Default fallback** (X days)

> **Note:** Specific deadline values are approximate in this demo to protect proprietary business logic. The production system uses precise values based on Brazilian Civil Procedure Code (CPC) and Labor Law (CLT).

See `src/services/orchestrators/IntimationOrchestratorService.ts` → `determineDeadline()` for implementation.

---

## 📈 AI Engineering Best Practices Demonstrated

### 1. **Cost Monitoring**
Every LLM call tracks estimated cost:
```typescript
const inputCost = promptTokens * COST_PER_INPUT_TOKEN;
const outputCost = completionTokens * COST_PER_OUTPUT_TOKEN;
```

### 2. **Latency Tracking**
Response time measured for each call:
```typescript
const startTime = Date.now();
// ... API call ...
const responseTimeMs = Date.now() - startTime;
```

### 3. **Validation Rate**
Tracks JSON parsing success:
```typescript
validationSuccesses / (validationSuccesses + validationFailures)
```

### 4. **Aggregate Metrics**
Summary shows system-wide performance:
- Average latency across all calls
- Total cost for batch processing
- Overall validation success rate

---

## 🔍 Output Format

Results are saved to `output/processed_notifications.json`:

```json
{
  "timestamp": "2025-11-18T14:30:00.000Z",
  "summary": {
    "total_lawyers": 3,
    "total_notifications": 9
  },
  "notifications": [
    {
      "id": "256927443",
      "lawyer": "ALEXANDRE CORREA NASSER DE MELO",
      "court": "TRT3",
      "publication_date": "2025-04-15",
      "deadline_date": "2025-04-25",
      "deadline_days": 10,
      "applied_rule": "TRT3_LABOR_LAW",
      "act_type": "DESPACHO",
      "summary": "Brief summary of notification..."
    }
  ]
}
```

---

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

**Solution:** This demo doesn't use Prisma. If you see this error, ensure you're running the latest code version.

### "OpenAI API error: 401"

**Solution:** Check that your `API_KEY` in `.env` is valid and has credits.

```bash
# Test your key with curl
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $API_KEY"
```

### "MOCK_MODE not working"

**Solution:** Ensure `.env` file exists with `MOCK_MODE=true`. Check file with:

```bash
cat .env
```

### No notifications processed (0 total)

**Solution:** If `MOCK_MODE=false`, the system queries real API by today's date. Mock mode always processes sample notifications.

---

## 🔐 Security & IP Protection

### What's Real vs Simplified

| Component | Demo Version | Production Version |
|-----------|-------------|-------------------|
| LLM Prompt | 4 fields | 16+ fields with legal rules |
| Deadline Values | Approximate | Exact CPC/CLT values |
| Court Holidays | Real 2025 dates | Updated annually |
| Sample Data | Anonymized real structure | Live government API |

### API Keys

- Never commit `.env` to Git
- Use `.env.example` as template
- Rotate OpenAI keys regularly
- Monitor usage at [platform.openai.com](https://platform.openai.com/usage)

---

## 📚 Learn More

- **Production Architecture** - See [main README](../README.md) for v0→v1 evolution
- **Real Metrics** - 3,188 notifications, 99.22% success rate, $0.11/lawyer/month
- **System Design** - Fetch → Extract → Calculate → Validate pipeline
- **Dual Inference** - Human-in-the-loop validation strategy

---

## 📄 License

This is a portfolio demonstration. The production system contains proprietary business logic. Code shared here demonstrates:
- Software architecture patterns
- AI engineering best practices
- System design for LLM applications

**Not included:** Proprietary prompts, exact deadline rules, client data.

---

## 💡 Contact

For questions about architecture, implementation, or AI engineering approaches demonstrated here, feel free to reach out!

Built with ❤️ for technical assessment and portfolio purposes.
