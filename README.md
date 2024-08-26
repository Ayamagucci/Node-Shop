## Environment Setup

1. **Sign Up for Mailtrap**: If you don't have a Mailtrap account, sign up for one at [Mailtrap](https://mailtrap.io/).

2. **Configure Environment Variables**:
   - Copy the `.env.example` file to a new file named `.env`.
   - Replace the placeholders in the `.env` file with your Mailtrap credentials.

   Example `.env` file:
   ```env
   MODE=development
   SERVER_PORT=3000
   DB_NAME=shop
   MAILTRAP_HOST=smtp.mailtrap.io
   MAILTRAP_PORT=587
   MAILTRAP_USER=your-mailtrap-username
   MAILTRAP_PW=your-mailtrap-password

3. **Secure Your Real Credentials**:
   - Ensure that your real `.env` file (containing actual Mailtrap credentials) is not included in your version control by adding .env to your .gitignore file.
