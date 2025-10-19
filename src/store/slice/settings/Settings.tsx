import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { SystemSettings, SettingsRequest } from "@/types/settings";
import { getSettings, updateSettings } from "@/services/SettingsApi";

interface SettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  saving: false,
  error: null,
};

export const FetchSettingsAction = createAsyncThunk(
  "settings/fetchSettings",
  async () => {
    return await getSettings();
  }
);

export const UpdateSettingsAction = createAsyncThunk(
  "settings/updateSettings",
  async (data: SettingsRequest) => {
    const response = await updateSettings(data);
    return response.data;
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch settings
    builder
      .addCase(FetchSettingsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchSettingsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(FetchSettingsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch settings";
      });

    // Update settings
    builder
      .addCase(UpdateSettingsAction.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(UpdateSettingsAction.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          state.settings = action.payload;
        }
      })
      .addCase(UpdateSettingsAction.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update settings";
      });
  },
});

export default settingsSlice.reducer;
