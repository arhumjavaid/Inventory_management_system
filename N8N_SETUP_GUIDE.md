# n8n Chatbot Integration Guide

This guide will help you set up the n8n workflow for your inventory management chatbot.

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/chatbot
```

Replace with your actual n8n webhook URL (production or local).

### 2. Configure Your n8n Workflow

#### Webhook Node Setup
- **HTTP Method**: POST
- **Path**: `chatbot` (or your preferred path)
- **Response Mode**: "When Last Node Finishes"

#### AI Agent Node Setup (Google Gemini or OpenAI)

**System Prompt/Instructions:**
```
You are an intelligent assistant for an inventory management system called SmartStock.

DATABASE STRUCTURE:
- products: Contains product details (id, name, category, price, stock_level, reorder_point, description)
- sales: Contains sales records (id, product_id, quantity, sale_date, customer_name, total_amount)
- purchases: Contains purchase records (id, product_id, quantity, purchase_date, supplier_name, cost)
- users: Contains user information (id, name, email, role)
- alerts: Contains system alerts (id, type, message, status, created_at)
- reports: Contains generated reports

CAPABILITIES:
- Answer questions about inventory levels, products, sales, and purchases
- Provide insights from the database
- Help users find specific information
- Be friendly, concise, and helpful

When a user asks a question:
1. Identify which table(s) contain the relevant information
2. Use the Supabase tool to query the data
3. Present the information in a clear, user-friendly format
4. If you need to check multiple tables, explain what you're doing

Always be specific and cite actual data from the database.
```

#### Supabase Node Setup
- **Credential**: Your Supabase account
- **Resource**: Row
- **Operation**: Get Many (for read operations)
- **Table**: Dynamic based on AI agent's decision

**For dynamic table selection:**
Use an expression in the Table field:
```javascript
{{ $json.table }}
```

#### Respond to Webhook Node
Configure the response format:
```javascript
{
  "response": {{ $json.response }},
  "message": {{ $json.response }},
  "timestamp": "{{ $now }}",
  "metadata": {
    "intent": "{{ $json.intent }}",
    "table": "{{ $json.table }}"
  }
}
```

### 3. Sample Workflow Configuration

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "chatbot",
        "responseMode": "lastNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "text": "={{ $json.body.message || $json.body.chatInput }}",
        "options": {
          "systemMessage": "You are an intelligent assistant for SmartStock inventory management..."
        }
      },
      "name": "AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "={{ $json.table }}",
        "returnAll": false,
        "limit": 10
      },
      "name": "Supabase",
      "type": "n8n-nodes-base.supabase"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { response: $json.response, timestamp: $now } }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook"
    }
  ]
}
```

## Testing Your Setup

### Test Connection
1. Start your n8n instance
2. Activate your workflow
3. Copy the webhook URL from n8n
4. Update your `.env` file with the webhook URL
5. Restart your React dev server

### Test Messages
Try these sample questions:
- "Show me all products"
- "What are the recent sales?"
- "Which products are low in stock?"
- "Show me purchase history"
- "What alerts do I have?"

## Troubleshooting

### Error: "Cannot connect to n8n"
- Check if n8n is running
- Verify the webhook URL in `.env`
- Ensure the workflow is activated in n8n

### Error: "CORS policy"
If you get CORS errors, add this to your n8n webhook node settings:
- Enable CORS: Yes
- Or configure n8n to allow your frontend URL

### Error: "The value 'select' is not supported"
- Use "Get Many" operation instead of "select"
- Ensure you're using the latest Supabase node version

### AI Agent not querying database
- Check your system prompt includes table information
- Verify Supabase credentials are correctly set
- Ensure the AI agent has access to the Supabase tool

## Advanced Features

### Adding Memory (Conversation History)
Configure the AI Agent's memory to remember previous messages:
- Add a Window Buffer Memory node
- Set conversation length (e.g., last 5 messages)

### Custom Filters
To filter results dynamically:
```javascript
{
  "filterBy": "{{ $json.filterField }}",
  "filterValue": "{{ $json.filterValue }}"
}
```

### Multiple Table Queries
If you need to query multiple tables, add a Switch node or IF node to route based on intent.

## Database Tables Reference

### Products Table
- `id`, `name`, `category`, `price`, `stock_level`, `reorder_point`, `description`

### Sales Table
- `id`, `product_id`, `quantity`, `sale_date`, `customer_name`, `total_amount`

### Purchases Table
- `id`, `product_id`, `quantity`, `purchase_date`, `supplier_name`, `cost`

### Users Table
- `id`, `name`, `email`, `role`

### Alerts Table
- `id`, `type`, `message`, `status`, `created_at`

## Support

For issues or questions:
1. Check n8n logs for errors
2. Verify webhook is receiving requests (check n8n executions)
3. Test with simple messages first
4. Ensure Supabase credentials have read permissions

---

**Ready to test?** Start your n8n workflow and try sending a message through your chatbot!
