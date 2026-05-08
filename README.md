# Design System Auditor

A Figma plugin that audits your designs against a predefined design system, providing scores and feedback on component usage, text styles, and color tokens.

## Features

- **Component Audit**: Checks if components used in your design are from the approved design system library.
- **Text Style Audit**: Verifies that text elements use design system text styles.
- **Color Token Audit**: Ensures colors are from the design system color palette.
- **Scoring System**: Provides an overall score based on adherence to the design system, with weighted categories.
- **Detailed Reports**: Lists non-compliant elements for easy identification and fixing.

## Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd design-system-auditor-ts
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the plugin:

   ```bash
   npm run build
   ```

4. In Figma, go to **Plugins > Development > Import plugin from manifest...** and select the `manifest.json` file from this project.

## Usage

1. Open your Figma file.
2. Select the frames or elements you want to audit.
3. Run the "Design System Auditor" plugin from the Plugins menu.
4. If prompted, enter your Figma API key (required for accessing design system files).
5. Choose whether to include private components in the audit.
6. Click "Audit Design" to start the analysis.
7. Review the results, including overall score and detailed breakdowns.

## Configuration

The plugin is configured to audit against specific design system files. To customize:

- Edit `src/code.ts` to update the `designSystemFiles` object with your design system file keys.
- Adjust scoring weights in the `scoringWeights` object.
- Modify deprecated styles and other settings as needed.

## API Key Setup

The plugin requires a Figma API key to access design system files:

1. Go to [Figma Account Settings](https://www.figma.com/settings).
2. Scroll to "Personal access tokens" and create a new token.
3. Copy the token and paste it into the plugin's configuration screen.

## Building

- `npm run build:code`: Builds the main plugin code.
- `npm run build:ui`: Builds the UI code.
- `npm run build:html`: Generates the UI HTML.
- `npm run build`: Runs all build steps.

## Development

- Source code is in TypeScript.
- UI is built with vanilla JavaScript and HTML.
- Uses esbuild for bundling.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Build and test the plugin.
5. Submit a pull request.

## License

[Add license information here]</content>
<parameter name="filePath">/Users/lechwojas/Desktop/Dev work/Riverty/Figma_plugins/design-system-auditor-ts/README.md
