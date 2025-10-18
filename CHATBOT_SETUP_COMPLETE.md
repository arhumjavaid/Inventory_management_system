# 🚀 n8n Chatbot Setup Complete!

Your n8n chatbot integration is now ready to use. Here's what was set up:

## ✅ Files Updated

1. **`src/lib/n8n.js`** - Enhanced with:
   - `sendMessageToN8N()` - Send messages to your n8n workflow
   - `initializeChatSession()` - Initialize user sessions
   - `testN8NConnection()` - Test your webhook connection
   - Better error handling and response parsing

2. **`src/components/ui/Chatbot.jsx`** - Updated to:
   - Use the n8n integration
   - Send user messages to your n8n webhook
   - Handle responses from n8n
   - Show helpful error messages if connection fails

3. **`.env.example`** - Template for environment variables

4. **`N8N_SETUP_GUIDE.md`** - Complete setup guide

5. **`n8n-system-prompt.md`** - AI agent system prompt with database structure

6. **`test-n8n.js`** - Connection test script

## 📋 Next Steps

### Step 1: Create `.env` file
Create a `.env` file in your project root:

```bash
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/chatbot
```

**Important:** Replace with your actual n8n webhook URL!

### Step 2: Configure n8n Workflow
1. Open n8n (http://localhost:5678)
2. Create a new workflow with these nodes:
   - **Webhook** (POST, path: chatbot)
   - **AI Agent** (Google Gemini or OpenAI)
   - **Supabase** (Get Many operation)
   - **Respond to Webhook**

3. Copy the system prompt from `n8n-system-prompt.md` into your AI Agent node

4. Configure Supabase credentials in n8n

5. Activate the workflow and copy the webhook URL

### Step 3: Test the Connection
1. Update your `.env` file with the webhook URL
2. Restart your React dev server:
   ```bash
   npm run dev
   ```
3. Open your app and click the chatbot icon
4. Try asking: "Show me all products"

## 🧪 Testing Commands

Try these questions in your chatbot:
- "Show me all products"
- "What are the recent sales?"
- "Which products are low in stock?"
- "Show me purchase history"
- "What alerts do I have?"

## 📚 Documentation

- **Complete Setup Guide**: `N8N_SETUP_GUIDE.md`
- **System Prompt**: `n8n-system-prompt.md`
- **Environment Variables**: `.env.example`

## 🔧 Troubleshooting

### Chatbot not connecting?
1. Check n8n is running
2. Verify webhook URL in `.env`
3. Ensure workflow is activated
4. Check browser console for errors

### CORS errors?
Enable CORS in your n8n webhook node settings

### AI not querying database?
1. Verify Supabase credentials in n8n
2. Check system prompt includes table info
3. Make sure AI Agent has Supabase tool access

## 📊 Your Database Tables

Your n8n AI agent knows about these tables:
- ✅ **products** - Product inventory
- ✅ **sales** - Sales records
- ✅ **purchases** - Purchase history
- ✅ **users** - User accounts
- ✅ **alerts** - System alerts
- ✅ **reports** - Generated reports

## 🎯 What Your Chatbot Can Do

✨ Query any database table
✨ Provide real-time inventory insights
✨ Answer questions about sales and purchases
✨ Show low stock alerts
✨ Help manage inventory

## 🚨 Important Notes

1. **Webhook URL**: Must start with `http://` or `https://`
2. **Environment Variables**: Require app restart after changes
3. **n8n Workflow**: Must be activated to receive requests
4. **Supabase Permissions**: Ensure read access is enabled

## 🎉 Ready to Go!

Your chatbot is now configured to work with n8n and Supabase!

1. Set your webhook URL in `.env`
2. Start your n8n workflow
3. Open your app and start chatting!

---

Need help? Check `N8N_SETUP_GUIDE.md` for detailed instructions.
