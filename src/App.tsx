import { Avatar, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';
import * as React from 'react';

const API_GETURL = 'https://c616-2603-8000-ca01-ada4-929-8a0a-92e4-b178.ngrok-free.app/pets';
const API_URL = 'https://c616-2603-8000-ca01-ada4-929-8a0a-92e4-b178.ngrok-free.app/pet';

interface Pet {
  id: number;
  name: string;
  owner: string;
  imageUrl?: string;
  favoriteFood?: string;
  isFed: boolean;
  dateAdded: Date;
}

function App() {
  const [rows, setRows] = React.useState<Pet[]>([]);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 5 });
  const [open, setOpen] = React.useState(false);
  const [newPet, setNewPet] = React.useState({
    name: '',
    owner: '',
    imageUrl: '',
    favoriteFood: '',
  });

  React.useEffect(() => {
    axios.get(API_GETURL, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => {
        if (Array.isArray(res.data)) setRows(res.data);
      })
      .catch(err => console.error('Failed to fetch pets', err));
  }, []);

  const handleToggleFed = (id: number) => {
    setRows(prev => prev.map(row =>
      row.id === id ? { ...row, isFed: !row.isFed } : row
    ));
    // Optionally, you can still send the PATCH request in the background
    axios.patch(`${API_URL}/${id}`, {
      isFed: !rows.find(row => row.id === id)?.isFed,
    }).catch(error => {
      console.error('Failed to update fed status', error);
      // Optionally, rollback the change here if needed
    });
  };

  const handleRemove = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRows(prev => prev.filter(row => row.id !== id));
    } catch (error) {
      console.error('Failed to remove pet', error);
    }
  };

  const columns: GridColDef<Pet>[] = [
    { field: 'name', headerName: 'Pet Name', flex: 1 },
    { field: 'owner', headerName: 'Owner Name', flex: 1 },
    {
      field: 'imageUrl',
      headerName: 'Image',
      flex: 1,
      renderCell: (params: GridRenderCellParams<Pet>) => <Avatar alt={params.row.name} src={params.value} />, // fixed type and field
      sortable: false,
      filterable: false,
    },
    { field: 'favoriteFood', headerName: 'Favorite Food', flex: 1 },
    {
      field: 'isFed',
      headerName: 'Fed Status',
      flex: 1,
      renderCell: (params: GridRenderCellParams<Pet>) => (
        <Button
          variant={params.value ? 'contained' : 'outlined'}
          color={params.value ? 'success' : 'warning'}
          onClick={() => handleToggleFed(params.row.id)}
        >
          {params.value ? 'Pet Fed' : 'Feed Pet'}
        </Button>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'remove',
      headerName: 'Remove Pet',
      flex: 1,
      renderCell: (params: GridRenderCellParams<Pet>) => (
        <Button color="error" onClick={() => handleRemove(params.row.id)}>
          Remove
        </Button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewPet({ name: '', owner: '', imageUrl: '', favoriteFood: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPet({ ...newPet, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!newPet.name || !newPet.owner) return;
    try {
      const response = await axios.post(API_URL, {
        name: newPet.name,
        owner: newPet.owner,
        imageUrl: newPet.imageUrl,
        favoriteFood: newPet.favoriteFood,
        isFed: false,
      });
      const pet = response.data;
      setRows(prev => [
        ...prev,
        pet
      ]);
      handleClose();
    } catch (error) {
      console.error('Failed to add pet', error);
    }
  };

  const handleDownload = () => {
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pet-list-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={handleOpen}>Add Pet</Button>
        <Button variant="outlined" onClick={handleDownload}>Download List</Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add a New Pet</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField
            required
            label="Pet Name"
            name="name"
            value={newPet.name}
            onChange={handleChange}
            autoFocus
          />
          <TextField
            required
            label="Owner Name"
            name="owner"
            value={newPet.owner}
            onChange={handleChange}
          />
          <TextField
            label="Image URL"
            name="imageUrl"
            value={newPet.imageUrl}
            onChange={handleChange}
          />
          <TextField
            label="Favorite Food"
            name="favoriteFood"
            value={newPet.favoriteFood}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!newPet.name || !newPet.owner}>Save</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ width: '50vw' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          autoHeight
        />
      </Box>
    </Box>
  );
}

export default App;
