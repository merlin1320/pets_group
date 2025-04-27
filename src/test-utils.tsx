import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme();

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
