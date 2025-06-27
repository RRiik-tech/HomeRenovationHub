# Recommended VS Code Extensions for HomeConnect Pro

## Essential Extensions
1. **TypeScript Importer** - Auto import for TypeScript
2. **ES7+ React/Redux/React-Native snippets** - React code snippets
3. **Tailwind CSS IntelliSense** - Tailwind class suggestions
4. **Prettier - Code formatter** - Code formatting
5. **ESLint** - Code linting
6. **Auto Rename Tag** - HTML/JSX tag renaming
7. **Bracket Pair Colorizer** - Colored brackets
8. **Path Intellisense** - File path autocomplete

## Database Extensions
1. **PostgreSQL** - PostgreSQL syntax highlighting
2. **Database Client** - Database management in VS Code

## Additional Helpful Extensions
1. **GitLens** - Enhanced Git capabilities
2. **Thunder Client** - API testing (alternative to Postman)
3. **Live Server** - Development server
4. **Import Cost** - Shows import sizes
5. **Todo Highlight** - Highlight TODO comments

## VS Code Settings
Add these to your VS Code settings.json:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```