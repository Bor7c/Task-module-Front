import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as teamsApi from '../api/teamsApi';

interface TeamsState {
  list: any[];
  selectedTeam: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  list: [],
  selectedTeam: null,
  loading: false,
  error: null,
};

// --- Thunks ---

export const getTeams = createAsyncThunk('teams/getTeams', async () => {
  const response = await teamsApi.fetchTeams();
  return response.data;
});

export const getTeamDetail = createAsyncThunk('teams/getTeamDetail', async (id: number) => {
  const response = await teamsApi.fetchTeamDetail(id);
  return response.data;
});

export const createTeam = createAsyncThunk('teams/createTeam', async (data: { name: string }) => {
  const response = await teamsApi.createTeam(data);
  return response.data;
});

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, data }: { id: number; data: { name: string } }) => {
    const response = await teamsApi.updateTeam(id, data);
    return response.data;
  }
);

export const deleteTeam = createAsyncThunk('teams/deleteTeam', async (id: number) => {
  await teamsApi.deleteTeam(id);
  return id;
});

export const addTeamMember = createAsyncThunk(
  'teams/addTeamMember',
  async ({ teamId, userId }: { teamId: number; userId: number }) => {
    const response = await teamsApi.addTeamMember(teamId, userId);
    return response.data;
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeTeamMember',
  async ({ teamId, userId }: { teamId: number; userId: number }) => {
    const response = await teamsApi.removeTeamMember(teamId, userId);
    return response.data;
  }
);

// --- Slice ---

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
    updateMembers: (state, action: PayloadAction<any[]>) => {
        if (state.selectedTeam) {
            state.selectedTeam.members = action.payload;
        }
    },
  },
  extraReducers: (builder) => {
    builder
      // getTeams
      .addCase(getTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeams.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка при загрузке списка команд';
      })

      // getTeamDetail
      .addCase(getTeamDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamDetail.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(getTeamDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка при загрузке команды';
      })

      // createTeam
      .addCase(createTeam.fulfilled, (state, action: PayloadAction<any>) => {
        state.list.push(action.payload);
      })

      // updateTeam
      .addCase(updateTeam.fulfilled, (state, action: PayloadAction<any>) => {
        const updated = action.payload;
        const index = state.list.findIndex((team) => team.id === updated.id);
        if (index !== -1) {
          state.list[index] = updated;
        }
        if (state.selectedTeam?.id === updated.id) {
          state.selectedTeam = updated;
        }
      })

      // deleteTeam
      .addCase(deleteTeam.fulfilled, (state, action: PayloadAction<number>) => {
        state.list = state.list.filter((team) => team.id !== action.payload);
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = null;
        }
      })

      // addTeamMember
      .addCase(addTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.selectedTeam) {
          state.selectedTeam.members = action.payload.members;
        }
      })

      // removeTeamMember
      .addCase(removeTeamMember.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.selectedTeam) {
          state.selectedTeam.members = action.payload.members;
        }
      });

      
      
  },
});

export const { clearSelectedTeam, updateMembers } = teamsSlice.actions;
export default teamsSlice.reducer;
