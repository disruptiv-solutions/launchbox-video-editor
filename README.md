# React Video Editor Pro

React Video Editor Pro is a powerful, web-based video editing tool built with React and Next.js. This project allows users to create and edit videos with features like timeline editing, text overlays, and sound integration.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/react-video-editor-pro.git
   ```

2. Navigate to the project directory:

   ```
   cd react-video-editor-pro
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Create a `.env.local` file in the root directory and add your Pexels API key:

   ```
   NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
   ```

5. Start the development server:

   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project is organized with version-specific components and pages:

- `/versions`: Contains markdown files for each version's changelog.
- `/app/versions`: Contains version-specific pages.
- `/components/editor`: Contains version-specific editor components.

### Version Files and Folders

Each version of the React Video Editor is contained in its own folder under `/components/editor`. For example, version 1.0.0 is located at `/components/editor/version-1.0.0/ReactVideoEditor.tsx`.

To create a new version:

1. Create a new folder under `/components/editor` with the version number.
2. Copy the latest version's `ReactVideoEditor.tsx` file into the new folder.
3. Make your changes and improvements to the new version.
4. Create a new page for the version under `/app/versions`.
5. Add a new markdown file in the `/versions` folder with the changelog for the new version.

## Usage

The main page of the application displays a version changelog. Users can navigate to specific versions of the editor by clicking on the corresponding version link.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Remotion](https://www.remotion.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
