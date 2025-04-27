import { render, screen, waitFor } from './test-utils';
import userEvent from '@testing-library/user-event';
import App from './App';
import axios from 'axios';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('App', () => {
  const pets = [
    {
      id: 1,
      name: 'Buddy',
      owner: 'Alice',
      imageUrl: 'https://example.com/buddy.jpg',
      favoriteFood: 'Kibble',
      isFed: false,
      dateAdded: new Date('2025-04-27'),
    },
    {
      id: 2,
      name: 'Mittens',
      owner: 'Bob',
      imageUrl: 'https://example.com/mittens.jpg',
      favoriteFood: 'Fish',
      isFed: true,
      dateAdded: new Date('2025-04-27'),
    },
  ];

  beforeEach(() => {
    (mockedAxios.get as any).mockResolvedValue({ data: pets });
    (mockedAxios.post as any).mockResolvedValue({ data: {
      id: 3,
      name: 'Rex',
      owner: 'Charlie',
      imageUrl: 'https://example.com/rex.jpg',
      favoriteFood: 'Bones',
      isFed: false,
      dateAdded: new Date('2025-04-27'),
    }});
    (mockedAxios.patch as any).mockImplementation((_url: string, body: any) => {
      return Promise.resolve({ data: { isFed: body.isFed } });
    });
    (mockedAxios.delete as any).mockResolvedValue({});
  });

  it('renders the DataGrid and Add Pet button', async () => {
    render(<App />);
    expect(await screen.findByText('Add Pet')).toBeInTheDocument();
    expect(screen.getByText('Pet Name')).toBeInTheDocument();
    expect(screen.getByText('Owner Name')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Favorite Food')).toBeInTheDocument();
    expect(screen.getByText('Fed Status')).toBeInTheDocument();
    expect(screen.getByText('Remove Pet')).toBeInTheDocument();
  });

  it('opens and closes the Add Pet dialog', async () => {
    render(<App />);
    userEvent.click(screen.getByText('Add Pet'));
    expect(screen.getByText('Add a New Pet')).toBeInTheDocument();
    userEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(screen.queryByText('Add a New Pet')).not.toBeInTheDocument());
  });

  it('adds a new pet and displays it in the grid', async () => {
    render(<App />);
    userEvent.click(screen.getByText('Add Pet'));
    userEvent.type(screen.getByLabelText('Pet Name'), 'Rex');
    userEvent.type(screen.getByLabelText('Owner Name'), 'Charlie');
    userEvent.type(screen.getByLabelText('Image URL'), 'https://example.com/rex.jpg');
    userEvent.type(screen.getByLabelText('Favorite Food'), 'Bones');
    userEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
    expect(await screen.findByText('Rex')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Bones')).toBeInTheDocument();
  });

  it('toggles fed status and updates the button', async () => {
    render(<App />);
    const feedButton = await screen.findAllByRole('button', { name: /feed pet|pet fed/i });
    expect(feedButton[0]).toHaveTextContent('Feed Pet');
    userEvent.click(feedButton[0]);
    await waitFor(() => expect(feedButton[0]).toHaveTextContent('Pet Fed'));
    userEvent.click(feedButton[0]);
    await waitFor(() => expect(feedButton[0]).toHaveTextContent('Feed Pet'));
  });

  it('removes a pet from the grid', async () => {
    render(<App />);
    const removeButtons = await screen.findAllByText('Remove');
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    userEvent.click(removeButtons[0]);
    await waitFor(() => expect(screen.queryByText('Buddy')).not.toBeInTheDocument());
  });

  it('downloads the pet list as JSON', async () => {
    render(<App />);
    // Mock URL.createObjectURL and revokeObjectURL
    const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const clickSpy = vi.spyOn(document, 'createElement');
    userEvent.click(await screen.findByText('Download JSON'));
    expect(urlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledWith('a');
    expect(revokeSpy).toHaveBeenCalled();
    urlSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
