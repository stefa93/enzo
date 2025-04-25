// .storybook/preview.ts
import type { Preview, Decorator } from '@storybook/react';
import React from 'react';
import '../src/index.css';

// Adjust the decorator to return a component that uses the hook
const withTheme: Decorator = (StoryFn) => {
  // Define the component that will wrap the story
  const ThemedStory: React.FC = () => {
    // Force light theme for Storybook preview
    const theme = 'light';

    React.useEffect(() => {
      const htmlElement = document.documentElement;
      // Clean up previous theme classes and add the desired one
      htmlElement.classList.remove('light', 'dark');
      htmlElement.classList.add(theme);
    }, [theme]); // Effect runs once on mount

    // Render the original story function component
    return React.createElement(StoryFn);
  };

  // Return the wrapping component
  return React.createElement(ThemedStory);
};


const preview: Preview = {
  decorators: [withTheme], // Keep the theme decorator
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;