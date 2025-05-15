# Blog Post Generator for Shopify

This feature allows you to generate SEO-optimized blog posts for your Shopify store using OpenAI's GPT-4o model. 

## Setup

To use the blog post generator functionality, you need to set up your OpenAI API key:

1. Create a `.env.local` file in the root directory of your project
2. Add your OpenAI API key to the file:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```
3. Restart your development server

You can get an OpenAI API key by signing up at [https://platform.openai.com/](https://platform.openai.com/).

## How It Works

The blog post generator uses a secure server-side API route (`/api/generate`) to communicate with OpenAI. This approach:

1. Keeps your API key secure by making calls from the server
2. Avoids exposing the API key to client-side code
3. Provides better error handling and security

## Using the Blog Post Generator

1. Navigate to `/blog-post-generator/create` in your application
2. Select a topic from the dropdown menu
3. Enter relevant keywords (comma-separated)
4. Optionally, add specific instructions for content generation
5. Click "Generate Blog Post"
6. Review and edit the generated content 
7. Add a publication date (optional)
8. Save your post

## Features

- AI-powered content generation optimized for e-commerce
- Topic selection for different product categories
- Keyword inclusion for SEO optimization
- Rich text editor for post-generation editing
- Publication scheduling
- Secure server-side API calls

## Troubleshooting

If you encounter issues with the blog post generator:

- Make sure your OpenAI API key is correctly set as `OPENAI_API_KEY` in the `.env.local` file
- Verify the API key format - it should start with "sk-"
- Check that you have sufficient credits in your OpenAI account
- Ensure your internet connection is stable
- Check the server logs for any API-related errors

## API Key Security

This implementation uses a server-side API route that keeps your OpenAI API key secure. The key is never exposed to the client, which is the recommended approach for production applications.

Never commit your `.env.local` file to version control. It's added to the `.gitignore` file by default to prevent accidental exposure of your API key.

For production deployment, set the environment variables through your hosting provider's secured environment configuration. 